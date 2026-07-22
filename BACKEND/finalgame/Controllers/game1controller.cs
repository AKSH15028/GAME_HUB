using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using finalgame.Models;
using finalgame.Services;
using finalgame.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace finalgame.Controllers
{
    [ApiController]
    [Route("api/game1")]
    public class Game1Controller : ControllerBase
    {
        private readonly IDeckService _deckService;
        private readonly IMemoryCache _cache;
        private readonly AppDbContext _context;

        // Internal session state structure to track active game progress securely in memory cache
        private class ServerGameState
        {
            public int CorrectCardId { get; set; }
            public int Score { get; set; }
            public int Streak { get; set; }
            public int Strikes { get; set; }
        }

        public Game1Controller(IDeckService deckService, IMemoryCache cache, AppDbContext context)
        {
            _deckService = deckService;
            _cache = cache;
            _context = context;
        }

        /// <summary>
        /// Generates a randomized 3x3 layout, caches the answer key, and returns the obfuscated deck.
        /// </summary>
        [HttpPost("start")]
        public IActionResult StartRound([FromQuery] string sessionId = "", [FromQuery] int currentScore = 0, [FromQuery] int currentStreak = 0, [FromQuery] int currentStrikes = 0)
        {
            // 1. Generate the round layout using our deck engine
            var roundBundle = _deckService.GenerateNewRound();

            // 2. Track or spawn the state session parameters
            var activeSessionId = string.IsNullOrEmpty(sessionId) ? roundBundle.GameSessionId : sessionId;
            
            var state = new ServerGameState
            {
                CorrectCardId = roundBundle.TargetCard.CardId, // The index (0-8) that is correct
                Score = currentScore,
                Streak = currentStreak,
                Strikes = currentStrikes
            };

            // 3. Cache the state key server-side for 10 minutes max
            var cacheOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(10));
            _cache.Set(activeSessionId, state, cacheOptions);

            // 4. Overwrite generated session id if using an existing one, then return
            roundBundle.GameSessionId = activeSessionId;
            return Ok(roundBundle);
        }

        /// <summary>
        /// Validates player choice, adjusts score/strikes, and tracks high scores via SQLite.
        /// </summary>
        [HttpPost("guess")]
        public async Task<IActionResult> SubmitGuess([FromBody] GuessRequestDto request)
        {
            // 1. Verify that the session actually exists in our memory cache
            if (!_cache.TryGetValue(request.GameSessionId, out ServerGameState? state) || state == null)
            {
                return BadRequest("Invalid or expired game session.");
            }

            bool isCorrect = request.SelectedCardId == state.CorrectCardId;
            int pointsEarned = 0;

            if (isCorrect)
            {
                state.Streak += 1;
                // Score Math formula: [50 + (Seconds Remaining * 10)] * Streak Multiplier
                double timeBonus = Math.Max(0, request.SecondsRemaining) * 10;
                pointsEarned = (int)((50 + timeBonus) * state.Streak);
                state.Score += pointsEarned;
            }
            else
            {
                state.Streak = 0; // Break combo multiplier
                state.Strikes += 1;
            }

            bool isGameOver = state.Strikes >= 2;

            // 2. Build the result payload response
            var response = new GuessResultDto
            {
                IsCorrect = isCorrect,
                CorrectCardId = state.CorrectCardId, // Show them where the target card actually was
                PointsEarned = pointsEarned,
                CurrentScore = state.Score,
                CurrentStreak = state.Streak,
                Strikes = state.Strikes,
                IsGameOver = isGameOver
            };

            // 3. If the game concludes, sync high scores asynchronously to SQLite database
            if (isGameOver && !string.IsNullOrEmpty(request.Username))
            {
                await SaveLeaderboardEntryAsync(request.Username, state.Score, state.Streak);
                _cache.Remove(request.GameSessionId); // Wipe session cache clean
            }
            else if (!isGameOver)
            {
                // Update the cache with the new parameters for the next flip round action
                _cache.Set(request.GameSessionId, state);
            }

            return Ok(response);
        }

        // Database transactional assistant method
        private async Task SaveLeaderboardEntryAsync(string username, int score, int maxStreak)
        {
            // Look up or automatically instantiate player record profiles
            var player = await _context.Players.FirstOrDefaultAsync(p => p.Username == username);
            if (player == null)
            {
                player = new Player { Username = username };
                _context.Players.Add(player);
                await _context.SaveChangesAsync();
            }

            // Record this specific run snapshot inside the database leaderboard log
            var entry = new Leaderboard
            {
                PlayerID = player.PlayerID,
                HighScore = score,
                MaxStreak = maxStreak,
                DateAchieved = DateTime.UtcNow
            };

            _context.Leaderboard.Add(entry);
            await _context.SaveChangesAsync();
        }
    }
}
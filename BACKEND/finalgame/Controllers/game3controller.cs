using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using finalgame.Data;
using finalgame.Models;

namespace finalgame.Controllers
{
    [ApiController]
    [Route("api/game3")]
    public class Game3Controller : ControllerBase
    {
        private readonly AppDbContext _context;
        // Hardcoded single-session GUID for simplicity. Replace with user auth tokens if scaled.
        private static readonly Guid DefaultSessionId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        public Game3Controller(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/game
        [HttpGet]
        public async Task<IActionResult> GetSession()
        {
            var session = await _context.Game3Sessions.FindAsync(DefaultSessionId);
            if (session == null)
            {
                // Initialize an empty layout if no session exists yet
                session = new Game3Session 
                { 
                    Id = DefaultSessionId, 
                    Grid = new int[16], 
                    CurrentScore = 0, 
                    UpdatedAt = DateTime.UtcNow 
                };
                _context.Game3Sessions.Add(session);
                await _context.SaveChangesAsync();
            }
            return Ok(session);
        }

        // POST: api/game/move
        [HttpPost("move")]
        public async Task<IActionResult> SaveMove([FromBody] Game3Session updatedState)
        {
            var session = await _context.Game3Sessions.FindAsync(DefaultSessionId);
            if (session == null) return NotFound();

            // 1. Snapshot the CURRENT state into history before applying the new state
            var historyLog = new Game3MoveHistory
            {
                Id = Guid.NewGuid(),
                GameSessionId = session.Id,
                GridSnapshot = (int[])session.Grid.Clone(),
                ScoreSnapshot = session.CurrentScore,
                LoggedAt = DateTime.UtcNow
            };
            _context.Game3MoveHistories.Add(historyLog);

            // 2. Commit the new state incoming from Angular
            session.Grid = updatedState.Grid;
            session.CurrentScore = updatedState.CurrentScore;
            session.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(session);
        }

        // POST: api/game/undo
        [HttpPost("undo")]
        public async Task<IActionResult> UndoMove()
        {
            var session = await _context.Game3Sessions.FindAsync(DefaultSessionId);
            if (session == null) return NotFound();

            // Fetch the most recent history log entry
            var lastLog = await _context.Game3MoveHistories
                .Where(h => h.GameSessionId == session.Id)
                .OrderByDescending(h => h.LoggedAt)
                .FirstOrDefaultAsync();

            if (lastLog == null)
            {
                return BadRequest("No moves left to undo.");
            }

            // Revert session properties
            session.Grid = lastLog.GridSnapshot;
            session.CurrentScore = lastLog.ScoreSnapshot;
            session.UpdatedAt = DateTime.UtcNow;

            // Remove this step from history stack
            _context.Game3MoveHistories.Remove(lastLog);
            await _context.SaveChangesAsync();

            return Ok(session);
        }

        // POST: api/game/reset
        [HttpPost("reset")]
        public async Task<IActionResult> ResetGame()
        {
            var session = await _context.Game3Sessions.FindAsync(DefaultSessionId);
            if (session == null) return NotFound();

            // Clear layout & reset score
            session.Grid = new int[16];
            session.CurrentScore = 0;
            session.UpdatedAt = DateTime.UtcNow;

            // Clear history stack completely for this session
            var historicalLogs = _context.Game3MoveHistories.Where(h => h.GameSessionId == session.Id);
            _context.Game3MoveHistories.RemoveRange(historicalLogs);

            await _context.SaveChangesAsync();
            return Ok(session);
        }
    }
}
namespace finalgame.Models
{
    public class GuessRequestDto
    {
        public string GameSessionId { get; set; } = string.Empty;
        public int SelectedCardId { get; set; }
        public double SecondsRemaining { get; set; }
        public string Username { get; set; } = string.Empty; // To trace leaderboard high scores
    }

    public class GuessResultDto
    {
        public bool IsCorrect { get; set; }
        public int CorrectCardId { get; set; } // Revealed ONLY after they guess
        public int PointsEarned { get; set; }
        public int CurrentScore { get; set; }
        public int CurrentStreak { get; set; }
        public int Strikes { get; set; }
        public bool IsGameOver { get; set; }
    }
}
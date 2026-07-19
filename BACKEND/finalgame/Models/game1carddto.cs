namespace finalgame.Models
{
    public class CardDto
    {
        public int CardId { get; set; } // Position marker (0 to 8)
        public string Suit { get; set; } = string.Empty; // ♠, ♥, ♦, ♣
        public string Rank { get; set; } = string.Empty; // A, K, Q, J, 10-2
        public string ThemeColor { get; set; } = string.Empty; // e.g., "neon-border-red"
        public string TextColor { get; set; } = string.Empty; // e.g., "red-text"
    }

    public class GameSessionDto
    {
        public string GameSessionId { get; set; } = string.Empty;
        public CardDto TargetCard { get; set; } = null!;
        public List<CardDto> GridCards { get; set; } = new();
    }
}
namespace finalgame.Models
{
    public class Gamescores
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string  GameName { get; set; } = string.Empty;
        public int HighScore { get; set; }
        public int LastScore { get; set; }
    }
}
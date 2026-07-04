namespace finalgame.Models
{
    public class UserGameProgress
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int CurrentLevel { get; set; }
        public int TotalPoints { get; set; }
    }
}
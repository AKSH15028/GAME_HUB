using System;
using System.ComponentModel.DataAnnotations;

namespace finalgame.Models
{
    public class Game3Session
    {
        [Key]
        public Guid Id { get; set; }
        
        // Stores the serialized 4x4 grid array
        public int[] Grid { get; set; } = new int[16];
        
        // Acts as the Move Counter per your custom rules
        public int CurrentScore { get; set; }
        
        public DateTime UpdatedAt { get; set; }
    }

    public class GameHistoryLog
    {
        [Key]
        public Guid Id { get; set; }
        
        public Guid GameSessionId { get; set; }
        
        public int[] GridSnapshot { get; set; } = new int[16];
        
        public int ScoreSnapshot { get; set; }
        
        public DateTime LoggedAt { get; set; }
    }
}
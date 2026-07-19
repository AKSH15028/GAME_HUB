using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace finalgame.Models
{
    public class Leaderboard
    {
        [Key]
        public int ScoreID { get; set; }

        [Required]
        public int PlayerID { get; set; }

        [Required]
        public int HighScore { get; set; }

        [Required]
        public int MaxStreak { get; set; }

        public DateTime DateAchieved { get; set; } = DateTime.UtcNow;

        [ForeignKey("PlayerID")]
        public Player? Player { get; set; } // Capitalized class target "Player"
    }
}
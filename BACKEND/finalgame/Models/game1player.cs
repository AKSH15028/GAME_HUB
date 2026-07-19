using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace finalgame.Models
{
    public class Player
    {
        [Key]
        public int PlayerID { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        // Use the exact capitalized class name "Leaderboard"
        public ICollection<Leaderboard> LeaderboardEntries { get; set; } = new List<Leaderboard>();
    }
}
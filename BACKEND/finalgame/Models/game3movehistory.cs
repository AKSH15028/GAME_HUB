using System;
using System.ComponentModel.DataAnnotations;

namespace GameHub.Models
{
    public class GameMoveHistory
    {
        [Key]
        public int Id { get; set; }

        // Identifies the active session (allows for multi-tab or multi-user stability later)
        [Required]
        public string SessionId { get; set; } = "default-session";

        // Stores the 4x4 matrix as a JSON string (e.g., "[[2,0,0,0],[0,4,0,0],...]")
        [Required]
        public string GridStateJson { get; set; } = string.Empty;

        // Tracks the move number (+1 per valid turn)
        [Required]
        public int MoveCount { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
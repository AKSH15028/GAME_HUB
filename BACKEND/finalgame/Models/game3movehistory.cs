using System;
using System.ComponentModel.DataAnnotations;

namespace finalgame.Models
{
    public class Game3MoveHistory
    {
        [Key]
        public Guid Id { get; set; }

        public Guid GameSessionId { get; set; }

        public int[] GridSnapshot { get; set; } = new int[16];

        public int ScoreSnapshot { get; set; }

        public DateTime LoggedAt { get; set; } = DateTime.UtcNow;
    }
}
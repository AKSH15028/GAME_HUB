using System;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using finalgame.Models;

namespace finalgame.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Existing Game Entities
        public DbSet<Item> Items { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserGameProgress> UserGameProgresses { get; set; }
        public DbSet<Gamescores> GameScores { get; set; }
        public DbSet<Leaderboard> Leaderboard { get; set; }
        public DbSet<Player> Players { get; set; }

        // New 2048 Game (Game 3) Entities
        public DbSet<Game3Session> Game3Sessions { get; set; }
        public DbSet<Game3MoveHistory> Game3MoveHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- Existing Database Relationships & Tables ---
            modelBuilder.Entity<Player>()
                .ToTable("Players");

            modelBuilder.Entity<Leaderboard>()
                .ToTable("Leaderboard") // Maps to your SQL table "Leaderboard"
                .HasKey(l => l.ScoreID);

            modelBuilder.Entity<Leaderboard>()
                .HasOne(l => l.Player)
                .WithMany(p => p.LeaderboardEntries)
                .HasForeignKey(l => l.PlayerID)
                .OnDelete(DeleteBehavior.Cascade);


            // --- New 2048 Game (Game 3) Configurations ---
            // Handles flattening the 4x4 array matrix into a JSON string for SQLite storage
            modelBuilder.Entity<Game3Session>()
                .Property(g => g.Grid)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<int[]>(v, (JsonSerializerOptions?)null) ?? new int[16]
                );

            modelBuilder.Entity<Game3MoveHistory>()
                .Property(g => g.GridSnapshot)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<int[]>(v, (JsonSerializerOptions?)null) ?? new int[16]
                );
        }
    }
}
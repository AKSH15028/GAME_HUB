using System;
using Microsoft.EntityFrameworkCore;
using finalgame.Models;

namespace finalgame.Data;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Item> Items { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserGameProgress> UserGameProgresses { get; set; }
    public DbSet<Gamescores> GameScores { get; set; }

    public DbSet<Leaderboard> Leaderboard { get; set; }
    public DbSet<Player> Players { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Set up our explicit database relationships & tables
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
        }
    
}

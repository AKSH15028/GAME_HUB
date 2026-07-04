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
    
}

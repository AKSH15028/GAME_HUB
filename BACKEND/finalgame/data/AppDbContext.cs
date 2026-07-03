using System;
using Microsoft.EntityFrameworkCore;
using finalgame.Models;

namespace finalgame.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Item> Items { get; set; }
}

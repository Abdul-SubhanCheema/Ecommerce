using System;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class AppDbContext(DbContextOptions options) : DbContext(options)
{
    public DbSet<AppUser> Users { set; get; }
    public DbSet<Product> Product { set; get; }
    
    public DbSet<Photo> Photos { get; set; }

}

namespace API.Entities;

public class AppUser
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required byte[] HashPassword { get; set; }
    public required byte[] HashPassSalt { get; set; }

    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastActive { get; set; }

    // Navigation property - One user can have many reviews
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

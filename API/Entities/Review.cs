namespace API.Entities;

public class Review
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Comment { get; set; }
    public int Rating { get; set; } // 1-5 stars
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign Keys
    public required string ProductId { get; set; }
    public required string UserId { get; set; }

    // Navigation properties
    public Product Product { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}

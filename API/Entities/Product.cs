namespace API.Entities;

public class Product
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string ProductName { get; set; }
    public required string Description { get; set; }
    public string? ProductImageUrl { get; set; }
    public int Price { get; set; }
    public int Discount { get; set; }
    public int Quantity { get; set; }
    public string? Brand { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Foreign Key for Category
    public int? CategoryId { get; set; }

    // Navigation properties
    public Category? Category { get; set; }
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    // Calculated properties (not stored in database) - Disabled to prevent circular references
    // public double AverageRating => Reviews.Any() ? Math.Round(Reviews.Average(r => r.Rating), 1) : 0.0;
    // public int TotalReviews => Reviews.Count;
}

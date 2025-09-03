namespace API.Entities;

public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property - One category can have many products
    public ICollection<Product> Products { get; set; } = new List<Product>();
}

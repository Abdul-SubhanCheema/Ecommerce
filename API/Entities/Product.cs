namespace API.Entities;

public class Product
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public int MyProperty { get; set; }
    public required string ProductName { get; set; }
    public required string Description { get; set; }

    public string? ProductImageUrl { get; set; }
    public int Price { get; set; }
    public int Discount { get; set; }
    public int Quantity { get; set; }
    public ICollection<Photo> Photos { get; set; } = new List<Photo>();

}

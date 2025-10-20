namespace API.DTOs;

public class ProductCreateDto
{
    public required string ProductName { get; set; }
    public required string Description { get; set; }
    public int Price { get; set; }
    public int Discount { get; set; } = 0;
    public int Quantity { get; set; }
    public string? Brand { get; set; }
    public int? CategoryId { get; set; }
    public bool IsActive { get; set; } = true;
}

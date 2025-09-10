namespace API.DTOs;

public class ProductUpdateDto
{
    public required string ProductName { get; set; }
    public required string Description { get; set; }
    public string? ProductImageUrl { get; set; }
    public int Price { get; set; }
    public int Discount { get; set; }
    public int Quantity { get; set; }
    public string? Brand { get; set; }
    public int? CategoryId { get; set; }
}

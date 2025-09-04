namespace API.DTOs;

public class ProductDto
{
    public string Id { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public int Price { get; set; }
    public int Discount { get; set; }
    public int Quantity { get; set; }
    public string? Brand { get; set; }
    public int? CategoryId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Related data
    public CategoryDto? Category { get; set; }
    public List<PhotoDto> Photos { get; set; } = new();
    public List<ReviewDto> Reviews { get; set; } = new();

    // Calculated properties
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
}

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class PhotoDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? PublicId { get; set; }
    public string ProductId { get; set; } = string.Empty;
}

// public class ReviewDto
// {
//     public int Id { get; set; }
//     public string Title { get; set; } = string.Empty;
//     public string Comment { get; set; } = string.Empty;
//     public int Rating { get; set; }
//     public DateTime CreatedAt { get; set; }
//     public DateTime? UpdatedAt { get; set; }
//     public string ProductId { get; set; } = string.Empty;
//     public string UserId { get; set; } = string.Empty;
//     public UserSummaryDto User { get; set; } = new();
// }

public class UserSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class CategoryCreateDto
{
    public required string Name { get; set; }
}

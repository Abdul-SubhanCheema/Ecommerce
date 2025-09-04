
namespace API.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Comment { get; set; }
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public required string ProductId { get; set; }
    public required string UserId { get; set; }
    public UserSummaryDto User { get; set; } = null!;
}

public class UserMiniDto
{
    public string Id { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
}

public class ReviewStatsDto
{
    public int TotalReviews { get; set; }
    public double AverageRating { get; set; }
    public RatingDistributionDto RatingDistribution { get; set; } = null!;
}

public class RatingDistributionDto
{
    public int Five { get; set; }
    public int Four { get; set; }
    public int Three { get; set; }
    public int Two { get; set; }
    public int One { get; set; }
}
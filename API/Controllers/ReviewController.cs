using API.Data;
using API.DTOs;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReviewController : BaseApiController
{
    private readonly AppDbContext _context;

    public ReviewController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetProductReviews(string productId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var reviewDtos = reviews.Select(r => new ReviewDto
        {
            Id = r.Id,
            Title = r.Title,
            Comment = r.Comment,
            Rating = r.Rating,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt,
            ProductId = r.ProductId,
            UserId = r.UserId,
            User = new UserSummaryDto
            {
                Id = r.User.Id,
                UserName = r.User.UserName ?? "",
                Email = r.User.Email ?? ""
            }
        }).ToList();

        return Ok(reviewDtos);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<Review>>> GetUserReviews(string userId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.Product)
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Review>> GetReview(int id)
    {
        var review = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (review == null)
        {
            return NotFound(new { message = "Review not found" });
        }

        return Ok(review);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> CreateReview(ReviewCreateDto reviewDto)
    {
        // Get the authenticated user's ID from JWT token
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized(new { message = "User authentication required" });
        }

        // Override userId with authenticated user (security measure)
        reviewDto.UserId = currentUserId;

        // Check if user already reviewed this product
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.ProductId == reviewDto.ProductId && r.UserId == reviewDto.UserId);

        if (existingReview != null)
        {
            return Conflict(new { message = "You have already reviewed this product" });
        }

        // Verify product exists
        var product = await _context.Product.FindAsync(reviewDto.ProductId);
        if (product == null)
        {
            return BadRequest(new { message = "Product not found" });
        }

        // Verify user exists
        var user = await _context.Users.FindAsync(reviewDto.UserId);
        if (user == null)
        {
            return BadRequest(new { message = "User not found" });
        }

        // Validate rating
        if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
        {
            return BadRequest(new { message = "Rating must be between 1 and 5" });
        }

        var review = new Review
        {
            Title = reviewDto.Title,
            Comment = reviewDto.Comment,
            Rating = reviewDto.Rating,
            ProductId = reviewDto.ProductId,
            UserId = reviewDto.UserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Return clean DTO to avoid circular reference
        var createdReviewDto = new ReviewDto
        {
            Id = review.Id,
            Title = review.Title,
            Comment = review.Comment,
            Rating = review.Rating,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt,
            ProductId = review.ProductId,
            UserId = review.UserId,
            User = new UserSummaryDto
            {
                Id = user.Id,
                UserName = user.UserName ?? "",
                Email = user.Email ?? ""
            }
        };

        return CreatedAtAction(nameof(GetReview), new { id = review.Id }, createdReviewDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateReview(int id, ReviewUpdateDto reviewDto)
    {
        var review = await _context.Reviews.FindAsync(id);

        if (review == null)
        {
            return NotFound(new { message = "Review not found" });
        }

        // Verify the user owns this review (you might want to add authentication here)
        if (review.UserId != reviewDto.UserId)
        {
            return Forbid("You can only update your own reviews");
        }

        review.Title = reviewDto.Title;
        review.Comment = reviewDto.Comment;
        review.Rating = reviewDto.Rating;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteReview(int id, [FromQuery] string userId)
    {
        var review = await _context.Reviews.FindAsync(id);

        if (review == null)
        {
            return NotFound(new { message = "Review not found" });
        }

        // Verify the user owns this review (you might want to add authentication here)
        if (review.UserId != userId)
        {
            return Forbid("You can only delete your own reviews");
        }

        _context.Reviews.Remove(review);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("stats/product/{productId}")]
    public async Task<ActionResult<ReviewStatsDto>> GetProductReviewStats(string productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId)
            .ToListAsync();

        if (!reviews.Any())
        {
            return Ok(new ReviewStatsDto
            {
                TotalReviews = 0,
                AverageRating = 0.0,
                RatingDistribution = new RatingDistributionDto
                {
                    Five = 0,
                    Four = 0,
                    Three = 0,
                    Two = 0,
                    One = 0
                }
            });
        }

        var stats = new ReviewStatsDto
        {
            TotalReviews = reviews.Count,
            AverageRating = Math.Round(reviews.Average(r => r.Rating), 1),
            RatingDistribution = new RatingDistributionDto
            {
                Five = reviews.Count(r => r.Rating == 5),
                Four = reviews.Count(r => r.Rating == 4),
                Three = reviews.Count(r => r.Rating == 3),
                Two = reviews.Count(r => r.Rating == 2),
                One = reviews.Count(r => r.Rating == 1)
            }
        };

        return Ok(stats);
    }
}

public class ReviewCreateDto
{
    public required string Title { get; set; }
    public required string Comment { get; set; }
    public int Rating { get; set; } // 1-5
    public required string ProductId { get; set; }
    public required string UserId { get; set; }
}

public class ReviewUpdateDto
{
    public required string Title { get; set; }
    public required string Comment { get; set; }
    public int Rating { get; set; } // 1-5
    public required string UserId { get; set; }
}

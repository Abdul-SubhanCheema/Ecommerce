using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
    public async Task<ActionResult<IEnumerable<Review>>> GetProductReviews(string productId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Ok(reviews);
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
    public async Task<ActionResult<Review>> CreateReview(ReviewCreateDto reviewDto)
    {
        // Check if user already reviewed this product
        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.ProductId == reviewDto.ProductId && r.UserId == reviewDto.UserId);

        if (existingReview != null)
        {
            return BadRequest(new { message = "User has already reviewed this product" });
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

        var review = new Review
        {
            Title = reviewDto.Title,
            Comment = reviewDto.Comment,
            Rating = reviewDto.Rating,
            ProductId = reviewDto.ProductId,
            UserId = reviewDto.UserId
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Return review with included data
        var createdReview = await _context.Reviews
            .Include(r => r.User)
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == review.Id);

        return CreatedAtAction(nameof(GetReview), new { id = review.Id }, createdReview);
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
    public async Task<ActionResult> GetProductReviewStats(string productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId)
            .ToListAsync();

        if (!reviews.Any())
        {
            return Ok(new
            {
                totalReviews = 0,
                averageRating = 0.0,
                ratingDistribution = new { five = 0, four = 0, three = 0, two = 0, one = 0 }
            });
        }

        var stats = new
        {
            totalReviews = reviews.Count,
            averageRating = Math.Round(reviews.Average(r => r.Rating), 1),
            ratingDistribution = new
            {
                five = reviews.Count(r => r.Rating == 5),
                four = reviews.Count(r => r.Rating == 4),
                three = reviews.Count(r => r.Rating == 3),
                two = reviews.Count(r => r.Rating == 2),
                one = reviews.Count(r => r.Rating == 1)
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

using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PhotoController : BaseApiController
{
    private readonly AppDbContext _context;

    public PhotoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<Photo>>> GetProductPhotos(string productId)
    {
        var photos = await _context.Photos
            .Where(p => p.ProductId == productId)
            .OrderBy(p => p.Id)
            .ToListAsync();

        return Ok(photos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Photo>> GetPhoto(int id)
    {
        var photo = await _context.Photos
            .FirstOrDefaultAsync(p => p.Id == id);

        if (photo == null)
        {
            return NotFound(new { message = "Photo not found" });
        }

        return Ok(photo);
    }

    [HttpPost]
    public async Task<ActionResult<Photo>> AddPhoto(PhotoCreateDto photoDto)
    {
        // Verify product exists
        var product = await _context.Product.FindAsync(photoDto.ProductId);
        if (product == null)
        {
            return BadRequest(new { message = "Product not found" });
        }

        var photo = new Photo
        {
            Url = photoDto.Url,
            ProductId = photoDto.ProductId
        };

        _context.Photos.Add(photo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPhoto), new { id = photo.Id }, photo);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdatePhoto(int id, PhotoUpdateDto photoDto)
    {
        var photo = await _context.Photos.FindAsync(id);

        if (photo == null)
        {
            return NotFound(new { message = "Photo not found" });
        }

        photo.Url = photoDto.Url;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePhoto(int id)
    {
        var photo = await _context.Photos.FindAsync(id);

        if (photo == null)
        {
            return NotFound(new { message = "Photo not found" });
        }

        _context.Photos.Remove(photo);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("product/{productId}/batch")]
    public async Task<ActionResult<IEnumerable<Photo>>> AddMultiplePhotos(string productId, List<PhotoUrlDto> photoUrls)
    {
        // Verify product exists
        var product = await _context.Product.FindAsync(productId);
        if (product == null)
        {
            return BadRequest(new { message = "Product not found" });
        }

        var photos = photoUrls.Select(dto => new Photo
        {
            Url = dto.Url,
            ProductId = productId
        }).ToList();

        _context.Photos.AddRange(photos);
        await _context.SaveChangesAsync();

        return Ok(photos);
    }

    [HttpDelete("product/{productId}/all")]
    public async Task<ActionResult> DeleteAllProductPhotos(string productId)
    {
        var photos = await _context.Photos
            .Where(p => p.ProductId == productId)
            .ToListAsync();

        if (!photos.Any())
        {
            return Ok(new { message = "No photos found for this product" });
        }

        _context.Photos.RemoveRange(photos);
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Deleted {photos.Count} photos" });
    }
}

public class PhotoCreateDto
{
    public required string Url { get; set; }
    public required string ProductId { get; set; }
}

public class PhotoUpdateDto
{
    public required string Url { get; set; }
}

public class PhotoUrlDto
{
    public required string Url { get; set; }
}

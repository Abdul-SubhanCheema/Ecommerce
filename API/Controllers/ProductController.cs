using API.Entities;
using API.Interfaces;
using API.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    public class ProductController(IProductRepo productRepo) : BaseApiController
    {
        private readonly IProductRepo _productRepo = productRepo;

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAllProducts()
        {
            var products = await _productRepo.GetAllProducts();
            var productDtos = products.Select(MapToProductDto).ToList();
            return Ok(productDtos);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProductsByCategory(int categoryId)
        {
            var products = await _productRepo.GetProductsByCategoryAsync(categoryId);
            var productDtos = products.Select(MapToProductDto).ToList();
            return Ok(productDtos);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProductById(string id)
        {
            var product = await _productRepo.GetProductByIdSAsync(id);
            if (product == null) return NotFound();
            return Ok(MapToProductDto(product));
        }


        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> GetPhotosForProduct(string id)
        {
            var photos = await _productRepo.GetPhotosForProductAsync(id);
            if (photos == null || !photos.Any()) return NotFound("No photos found for this product.");
            return Ok(photos);
        }


        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateProduct(string id, Product product)
        {
            if (id != product.Id) return BadRequest("Product ID mismatch.");

            _productRepo.Update(product);

            if (await _productRepo.SaveAllAsync())
                return NoContent();

            return BadRequest("Failed to update product.");
        }


        // 🚀 POST add new product with photos
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            // Add product to context
           await _productRepo.Add(product);

            if (await _productRepo.SaveAllAsync())
            {
                // Return 201 Created with route to newly added product
                return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
            }

            return BadRequest("Failed to create product.");
        }

        // Mapping methods
        private static ProductDto MapToProductDto(Product product)
        {
            return new ProductDto
            {
                Id = product.Id,
                ProductName = product.ProductName,
                Description = product.Description,
                ProductImageUrl = product.ProductImageUrl,
                Price = product.Price,
                Discount = product.Discount,
                Quantity = product.Quantity,
                Brand = product.Brand,
                CategoryId = product.CategoryId,
                IsActive = product.IsActive,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                Category = product.Category != null ? new CategoryDto
                {
                    Id = product.Category.Id,
                    Name = product.Category.Name,
                    CreatedAt = product.Category.CreatedAt
                } : null,
                Photos = product.Photos.Select(p => new PhotoDto
                {
                    Id = p.Id,
                    Url = p.Url,
                    PublicId = p.PublicId,
                    ProductId = p.ProductId ?? string.Empty
                }).ToList(),
                Reviews = product.Reviews.Select(r => new ReviewDto
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
                        UserName = r.User.UserName,
                        Email = r.User.Email,
                        ImageUrl = r.User.ImageUrl
                    }
                }).ToList(),
                AverageRating = product.Reviews.Any() ? Math.Round(product.Reviews.Average(r => r.Rating), 1) : 0.0,
                TotalReviews = product.Reviews.Count
            };
        }
    }
}

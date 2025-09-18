using API.Entities;
using API.Interfaces;
using API.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    public class ProductController(IProductRepo productRepo, IPhoto photoService) : BaseApiController
    {
        private readonly IProductRepo _productRepo = productRepo;

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetAllProducts()
        {
            var products = await _productRepo.GetAllProducts();
            var productDtos = products.Select(MapToProductDto).ToList();
            return Ok(productDtos);
        }
        [HttpGet("deals")]
        public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetDealsProducts()
        {
            var products = await _productRepo.GetDealsProductsAsync();
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
        public async Task<ActionResult<ProductDto>> UpdateProduct(string id, ProductUpdateDto updateDto)
        {
            var existingProduct = await _productRepo.GetProductByIdSAsync(id);
            if (existingProduct == null) return NotFound("Product not found.");

            // Update only the provided fields
            existingProduct.ProductName = updateDto.ProductName;
            existingProduct.Description = updateDto.Description;
            existingProduct.Price = updateDto.Price;
            existingProduct.Discount = updateDto.Discount;
            existingProduct.Quantity = updateDto.Quantity;
            existingProduct.Brand = updateDto.Brand;
            existingProduct.CategoryId = updateDto.CategoryId;
            //existingProduct.ProductImageUrl = updateDto.ProductImageUrl;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            _productRepo.Update(existingProduct);

            if (await _productRepo.SaveAllAsync())
            {
                // Reload the product with updated category information
                var updatedProduct = await _productRepo.GetProductByIdSAsync(id);
                return Ok(MapToProductDto(updatedProduct!));
            }

            return BadRequest("Failed to update product.");
        }

        [HttpPost("add-photo")]
        [RequestSizeLimit(100 * 1024 * 1024)] // 100MB limit
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Photo>> AddPhoto([FromForm] IFormFile file, [FromForm] string id)
        {
            // Console.WriteLine($"AddPhoto called with id: {id}");
            // Console.WriteLine($"File: {file?.FileName}, Size: {file?.Length}, ContentType: {file?.ContentType}");
            
            if (file == null || string.IsNullOrEmpty(id))
            {
                return BadRequest("File and ID are required.");
            }
            
            var product = await _productRepo.GetProductForUpdate(id);
            if (product == null) return BadRequest("Product can't be Updated.");

            var result = await photoService.UploadPhotoAsync(file);
            if (result.Error != null) return BadRequest(result.Error.Message);
            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                ProductId = product.Id
            };
            if (product.ProductImageUrl == null)
            {
                product.ProductImageUrl = photo.Url;
            }
            product.Photos.Add(photo);
            if (await _productRepo.SaveAllAsync()) return photo;

            return BadRequest("Failed to add photo to product.");



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

        // 🗑️ DELETE product
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(string id)
        {
            var product = await _productRepo.GetProductByIdSAsync(id);
            if (product == null) return NotFound("Product not found.");

            _productRepo.Delete(product);

            if (await _productRepo.SaveAllAsync())
            {
                return NoContent(); // 204 No Content for successful deletion
            }

            return BadRequest("Failed to delete product.");
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

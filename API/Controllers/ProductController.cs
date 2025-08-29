using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{

    public class ProductController(IProductRepo productRepo) : BaseApiController
    {
        private readonly IProductRepo _productRepo = productRepo;

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Product>>> GetAllProducts()
        {
            var products = await _productRepo.GetAllProducts();
            return Ok(products);
        }


        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProductById(string id)
        {
            var product = await _productRepo.GetProductByIdSAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
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
    }
}

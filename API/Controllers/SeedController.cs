using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SeedController : BaseApiController
{
    private readonly AppDbContext _context;

    public SeedController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("seed-all")]
    public async Task<ActionResult> SeedAll()
    {
        try
        {
            // Clear existing data
            await ClearDatabase();

            // Seed in order
            await SeedCategories();
            await SeedProducts();
            await SeedPhotos();
            await SeedReviews();

            return Ok(new { message = "Database seeded successfully!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("clear-database")]
    public async Task<ActionResult> ClearDatabase()
    {
        try
        {
            // Remove all data
            _context.Reviews.RemoveRange(_context.Reviews);
            _context.Photos.RemoveRange(_context.Photos);
            _context.Product.RemoveRange(_context.Product);
            _context.Categories.RemoveRange(_context.Categories);
            
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Database cleared successfully!" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("seed-categories")]
    public async Task<ActionResult> SeedCategories()
    {
        try
        {
            if (await _context.Categories.AnyAsync())
            {
                return Ok(new { message = "Categories already exist" });
            }

            var categories = new List<Category>
            {
                new() { Name = "Electronics" },
                new() { Name = "Clothing" },
                new() { Name = "Books" },
                new() { Name = "Home & Garden" },
                new() { Name = "Sports & Outdoors" }
            };

            _context.Categories.AddRange(categories);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Categories seeded successfully!", count = categories.Count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("seed-products")]
    public async Task<ActionResult> SeedProducts()
    {
        try
        {
            if (await _context.Product.AnyAsync())
            {
                return Ok(new { message = "Products already exist" });
            }

            var categories = await _context.Categories.ToListAsync();
            if (!categories.Any())
            {
                return BadRequest(new { error = "Categories must be seeded first" });
            }

            var products = new List<Product>
            {
                new()
                {
                    ProductName = "Smart Watch Pro",
                    Description = "Advanced smartwatch with fitness tracking, heart rate monitor, and GPS. Perfect for active lifestyle with 7-day battery life.",
                    ProductImageUrl = "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60",
                    Price = 299,
                    Discount = 15,
                    Quantity = 25,
                    Brand = "TechPro",
                    CategoryId = categories.First(c => c.Name == "Electronics").Id,
                    IsActive = true
                },
                new()
                {
                    ProductName = "Wireless Headphones",
                    Description = "Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.",
                    ProductImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
                    Price = 199,
                    Discount = 10,
                    Quantity = 40,
                    Brand = "AudioMax",
                    CategoryId = categories.First(c => c.Name == "Electronics").Id,
                    IsActive = true
                },
                new()
                {
                    ProductName = "Cotton T-Shirt",
                    Description = "Comfortable 100% organic cotton t-shirt. Available in multiple colors and sizes. Perfect for casual wear.",
                    ProductImageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60",
                    Price = 29,
                    Discount = 20,
                    Quantity = 100,
                    Brand = "StyleCo",
                    CategoryId = categories.First(c => c.Name == "Clothing").Id,
                    IsActive = true
                },
                new()
                {
                    ProductName = "Running Shoes",
                    Description = "Professional running shoes with advanced cushioning and breathable mesh upper. Ideal for marathon training.",
                    ProductImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60",
                    Price = 129,
                    Discount = 25,
                    Quantity = 30,
                    Brand = "RunFast",
                    CategoryId = categories.First(c => c.Name == "Sports & Outdoors").Id,
                    IsActive = true
                },
                new()
                {
                    ProductName = "Programming Book",
                    Description = "Complete guide to modern web development. Covers JavaScript, React, Node.js and best practices.",
                    ProductImageUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60",
                    Price = 45,
                    Discount = 0,
                    Quantity = 50,
                    Brand = "TechBooks",
                    CategoryId = categories.First(c => c.Name == "Books").Id,
                    IsActive = true
                },
                new()
                {
                    ProductName = "Garden Tools Set",
                    Description = "Complete gardening toolkit with premium stainless steel tools. Includes spade, rake, pruner, and carrying case.",
                    ProductImageUrl = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&auto=format&fit=crop&q=60",
                    Price = 89,
                    Discount = 30,
                    Quantity = 15,
                    Brand = "GreenThumb",
                    CategoryId = categories.First(c => c.Name == "Home & Garden").Id,
                    IsActive = true
                }
            };

            _context.Product.AddRange(products);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Products seeded successfully!", count = products.Count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("seed-photos")]
    public async Task<ActionResult> SeedPhotos()
    {
        try
        {
            if (await _context.Photos.AnyAsync())
            {
                return Ok(new { message = "Photos already exist" });
            }

            var products = await _context.Product.ToListAsync();
            if (!products.Any())
            {
                return BadRequest(new { error = "Products must be seeded first" });
            }

            var photos = new List<Photo>();

            // Add photos for Smart Watch
            var smartWatch = products.First(p => p.ProductName == "Smart Watch Pro");
            photos.AddRange(new[]
            {
                new Photo { Url = "https://images.unsplash.com/photo-1641457474717-26e699f45414?w=500&auto=format&fit=crop&q=60", ProductId = smartWatch.Id },
                new Photo { Url = "https://images.unsplash.com/photo-1660827857058-48419a156675?w=500&auto=format&fit=crop&q=60", ProductId = smartWatch.Id }
            });

            // Add photos for Headphones
            var headphones = products.First(p => p.ProductName == "Wireless Headphones");
            photos.AddRange(new[]
            {
                new Photo { Url = "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop&q=60", ProductId = headphones.Id },
                new Photo { Url = "https://images.unsplash.com/photo-1612196808214-b8b4fc0b8e5c?w=500&auto=format&fit=crop&q=60", ProductId = headphones.Id }
            });

            // Add photos for T-Shirt
            var tshirt = products.First(p => p.ProductName == "Cotton T-Shirt");
            photos.AddRange(new[]
            {
                new Photo { Url = "https://images.unsplash.com/photo-1618453292062-0f80dee4f8e4?w=500&auto=format&fit=crop&q=60", ProductId = tshirt.Id },
                new Photo { Url = "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=60", ProductId = tshirt.Id }
            });

            _context.Photos.AddRange(photos);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Photos seeded successfully!", count = photos.Count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("seed-reviews")]
    public async Task<ActionResult> SeedReviews()
    {
        try
        {
            if (await _context.Reviews.AnyAsync())
            {
                return Ok(new { message = "Reviews already exist" });
            }

            var products = await _context.Product.ToListAsync();
            var users = await _context.Users.ToListAsync();

            if (!products.Any())
            {
                return BadRequest(new { error = "Products must be seeded first" });
            }

            // If no users exist, create some dummy users for seeding
            if (!users.Any())
            {
                var dummyUsers = new List<AppUser>
                {
                    new() { UserName = "reviewer1", Email = "reviewer1@example.com", HashPassword = new byte[1], HashPassSalt = new byte[1] },
                    new() { UserName = "reviewer2", Email = "reviewer2@example.com", HashPassword = new byte[1], HashPassSalt = new byte[1] },
                    new() { UserName = "reviewer3", Email = "reviewer3@example.com", HashPassword = new byte[1], HashPassSalt = new byte[1] }
                };
                
                _context.Users.AddRange(dummyUsers);
                await _context.SaveChangesAsync();
                users = dummyUsers;
            }

            var reviews = new List<Review>();
            var random = new Random();

            // Add reviews for each product
            foreach (var product in products)
            {
                // Add 2-3 reviews per product
                var reviewCount = random.Next(2, 4);
                var selectedUsers = users.OrderBy(x => Guid.NewGuid()).Take(reviewCount).ToList();

                foreach (var user in selectedUsers)
                {
                    var rating = random.Next(3, 6); // Random rating between 3-5
                    var review = new Review
                    {
                        Title = GetRandomTitle(rating),
                        Comment = GetRandomComment(product.ProductName, rating),
                        Rating = rating,
                        ProductId = product.Id,
                        UserId = user.Id
                    };
                    reviews.Add(review);
                }
            }

            _context.Reviews.AddRange(reviews);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reviews seeded successfully!", count = reviews.Count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private static string GetRandomTitle(int rating)
    {
        var titles = rating switch
        {
            5 => new[] { "Excellent product!", "Amazing quality!", "Highly recommend!", "Perfect!" },
            4 => new[] { "Very good", "Great value", "Happy with purchase", "Good quality" },
            3 => new[] { "Decent product", "Average", "Okay for the price", "Not bad" },
            _ => new[] { "Good product" }
        };
        return titles[new Random().Next(titles.Length)];
    }

    private static string GetRandomComment(string productName, int rating)
    {
        var comments = rating switch
        {
            5 => new[] 
            {
                $"This {productName} exceeded my expectations! Outstanding quality and performance.",
                $"Absolutely love this {productName}. Works perfectly and great value for money.",
                $"Best {productName} I've ever bought. Highly recommend to everyone!"
            },
            4 => new[]
            {
                $"Very satisfied with this {productName}. Good quality and fast delivery.",
                $"Great {productName} for the price. Would buy again.",
                $"Happy with my purchase of this {productName}. Works as expected."
            },
            3 => new[]
            {
                $"The {productName} is okay. Does what it's supposed to do.",
                $"Average {productName}. Nothing special but gets the job done.",
                $"Decent {productName} for the price point."
            },
            _ => new[] { $"Good {productName} overall." }
        };
        return comments[new Random().Next(comments.Length)];
    }
}

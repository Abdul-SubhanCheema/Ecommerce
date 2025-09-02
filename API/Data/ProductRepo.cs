using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class ProductRepo(AppDbContext context) : IProductRepo
{
    public async Task<IReadOnlyList<Product>> GetAllProducts()
    {
        return await context.Product
            .Include(p => p.Photos)
            .ToListAsync();
    }

    public async Task<IReadOnlyList<Photo>> GetPhotosForProductAsync(string Id)
    {
        return await context.Product.Where(x => x.Id == Id)
        .SelectMany(x => x.Photos).ToListAsync();
    }

    public async Task<Product?> GetProductByIdSAsync(string Id)
    {
        return await context.Product
            .Include(p => p.Photos)
            .FirstOrDefaultAsync(p => p.Id == Id);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }

    public void Update(Product product)
    {
        context.Entry(product).State = EntityState.Modified;
    }
    public async Task Add(Product product)
    {
        await context.Product.AddAsync(product);
    }

}

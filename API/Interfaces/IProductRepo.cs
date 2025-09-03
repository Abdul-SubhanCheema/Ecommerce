using API.Entities;

namespace API.Interfaces;

public interface IProductRepo
{
    void Update(Product product);
    Task<bool> SaveAllAsync();

    Task<IReadOnlyList<Product>> GetAllProducts();
    Task<Product?> GetProductByIdSAsync(string Id);
    Task<IReadOnlyList<Product>> GetProductsByCategoryAsync(int categoryId);

    Task<IReadOnlyList<Photo>> GetPhotosForProductAsync(string Id);
    Task Add(Product product);
}

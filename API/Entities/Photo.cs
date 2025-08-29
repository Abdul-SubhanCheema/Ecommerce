namespace API.Entities;

public class Photo
{
    public int Id { get; set; }
    public required string Url { get; set; }
    public string? PublicId { get; set; }

  // Foreign key
    public string? ProductId { get; set; } = null!;
    

}

using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class Registerdto
{
    [Required]
    public  string UserName { get; set; } = "";
    [Required]
    [EmailAddress]
    public required string Email { get; set; } = "";
    [Required]
    [MinLength(4)]
    [MaxLength(8)]
    public string Password { get; set; } = "";
}

using System;

namespace API.DTOs;

public class Userdto
{
    public required string UserName { get; set; }
    public required string Id { get; set; }
    public required string Email { get; set; }
    public string? Imageurl { get; set; }
    public required string Token { get; set; }

}

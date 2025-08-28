using API.DTOs;
using API.Entities;
using API.Interfaces;

namespace API.Extensions;

public static class UserExtension
{
    public static Userdto ToDto(this AppUser user, ITokenService tokenService)
    {
         return new Userdto
        {
            UserName = user.UserName,
            Email = user.Email,
            Id = user.Id,
            Token = tokenService.CreateToken(user)
        };
    }
}

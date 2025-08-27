using System;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController(AppDbContext Context, ITokenService tokenService) : BaseApiController
{
    [HttpPost("register")]
    public async Task<ActionResult<Userdto>> Register(Registerdto registerdto)
    {
        if (await EmailExist(registerdto.Email)) return BadRequest("Email Already Exist");
        var hmac = new HMACSHA512();
        var user = new AppUser
        {
            UserName = registerdto.UserName,
            Email = registerdto.Email,
            HashPassword = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerdto.Password)),
            HashPassSalt = hmac.Key
        };
        Context.Users.Add(user);
        await Context.SaveChangesAsync();

        return user.ToDto(tokenService);
    }
    public async Task<bool> EmailExist(string email)
    {
        return await Context.Users.AnyAsync(x => x.Email.ToLower() == email.ToLower());
    }

    [HttpPost("login")]
    public async Task<ActionResult<Userdto>> Login(Logindto logindto)
    {
        var user = await Context.Users.SingleOrDefaultAsync(x => x.Email == logindto.Email);
        if (user == null) return Unauthorized("Invalid Email");

        var hmac = new HMACSHA512(user.HashPassSalt);
        var ComputedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(logindto.Password));

        for (int i = 0; i < ComputedHash.Length; i++)
        {
            if (ComputedHash[i] != user.HashPassword[i]) return Unauthorized("Invaid Password");
        }
        return user.ToDto(tokenService);
    }
   
}

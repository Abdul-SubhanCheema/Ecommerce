using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
                                     
    public class UsersController(AppDbContext Context) : BaseApiController
    {
        [HttpGet]
        public async Task< ActionResult<IReadOnlyList<AppUser>>> GetUsers()
        {
            var users = await Context.Users.ToListAsync();
            return users;
        }
        [HttpGet("{id}")]
        public async Task< ActionResult<AppUser>> GetUser(string id)
        {
            var user = await Context.Users.FindAsync(id);
            if (user == null) return NotFound();

            return user;

        }

    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using finalgame.Data; // Ensure this matches your namespace
using finalgame.Models; // Ensure this matches your model namespace

[Route("api/[controller]")]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/profile/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetProfile(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound();
        return user;
    }

    // PUT: api/profile/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(int id, User user)
    {
        if (id != user.Id) return BadRequest();

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Users.Any(e => e.Id == id)) return NotFound();
            else throw;
        }

        return NoContent();
    }
}
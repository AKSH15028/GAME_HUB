using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using finalgame.Models; // Ensure this matches your namespace
using finalgame.Data;   // Ensure this matches your namespace


namespace finalgame.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto registerDto)
{
            // 1. Check if user already exists
            if (_context.Users.Any(u => u.Email == registerDto.Email))
                return BadRequest("User already exists.");

            // 2. Hash the password
            var hasher = new PasswordHasher<User>();
            var user = new User
    {
        Username = registerDto.Username!,
        Email = registerDto.Email!,
        PasswordHash = hasher.HashPassword(null!, registerDto.Password!),// Hash the password
    };

    // 3. Save to database
    _context.Users.Add(user);
    _context.SaveChanges();

    return Ok(new { message = "Registration successful!" });
}
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            // 1. Validate credentials against your database
            var user = _context.Users.FirstOrDefault(u => u.Email == loginDto.Email);
            
            // Note: VerifyPassword should use a secure hashing library like BCrypt
            if (user == null || !VerifyPassword(loginDto.Password!, user.PasswordHash))
                return Unauthorized();

            // 2. Generate and return the JWT token
            var token = GenerateJwtToken(user);
            return Ok(new { 
            token = token, 
            id = user.Id, 
            username = user.Username, 
            email = user.Email 
            });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Standard claim for ID
            new Claim(JwtRegisteredClaimNames.Sub, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
};

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(60),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            if (string.IsNullOrEmpty(storedHash) || string.IsNullOrEmpty(password)) return false;
            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(null!, storedHash, password);
            return result != PasswordVerificationResult.Failed;
        }

    [HttpPost("logout")]
public IActionResult Logout()
{
    // Logic to blacklist the token or clear the authentication cookie
    // Example: Response.Cookies.Delete("your_auth_cookie_name");
    return Ok(new { message = "Logged out successfully" });
}

    }
}

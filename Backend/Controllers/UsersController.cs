using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PcGarage.Api.Data;
using PcGarage.Api.Models;

namespace PcGarage.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(string id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            return user;
        }

        // POST: api/Users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(user.Name))
            {
                return BadRequest(new { message = "Username-ul nu poate fi gol." });
            }
            if (user.Name.Length < 3 || user.Name.Length > 30)
            {
                return BadRequest(new { message = "Username-ul trebuie să aibă între 3 și 30 de caractere." });
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(user.Name, "^[a-zA-Z0-9 ]+$"))
            {
                return BadRequest(new { message = "Username-ul poate conține doar litere și cifre." });
            }
            if (string.IsNullOrWhiteSpace(user.Email) || user.Email.Length > 255)
            {
                return BadRequest(new { message = "Adresa de email nu este validă." });
            }
            try
            {
                var addr = new System.Net.Mail.MailAddress(user.Email);
                if (addr.Address != user.Email || !user.Email.Contains(".") || user.Email.Split('@')[1].Length < 3)
                {
                    return BadRequest(new { message = "Adresa de email nu este validă." });
                }
            }
            catch
            {
                return BadRequest(new { message = "Adresa de email nu este validă." });
            }
            if (string.IsNullOrWhiteSpace(user.Password) || user.Password.Length < 8)
            {
                return BadRequest(new { message = "Parola trebuie să aibă minim 8 caractere." });
            }
            if (!System.Text.RegularExpressions.Regex.IsMatch(user.Password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)"))
            {
                return BadRequest(new { message = "Parola trebuie să conțină minim o literă mare, una mică și o cifră." });
            }
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                return BadRequest(new { message = "Acest email este deja înregistrat." });
            }

            // Force role to customer – admin accounts can only be created directly in the database
            user.Role = "customer";
            user.CreatedAt = DateTime.UtcNow;

            // Hash password using BCrypt
            if (!string.IsNullOrEmpty(user.Password) && !IsBCryptHash(user.Password))
            {
                user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password, workFactor: 12);
            }

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        // POST: api/Users/login
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody] LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest(new { message = "Email-ul și parola sunt obligatorii." });
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Email sau parolă incorectă." });
            }

            bool isPasswordValid = false;
            try
            {
                isPasswordValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password);
            }
            catch
            {
                // Fallback for plain text passwords (e.g. existing/seeded users)
                isPasswordValid = user.Password == loginDto.Password;
                if (isPasswordValid)
                {
                    // Migrate plain text password to BCrypt hash
                    user.Password = BCrypt.Net.BCrypt.HashPassword(loginDto.Password, workFactor: 12);
                    await _context.SaveChangesAsync();
                }
            }

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Email sau parolă incorectă." });
            }

            return Ok(user);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, User user)
        {
            if (id != user.Id)
            {
                return BadRequest();
            }

            // Handle password updates securely
            var existingUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            if (existingUser != null)
            {
                if (user.Password != existingUser.Password && !IsBCryptHash(user.Password))
                {
                    user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password, workFactor: 12);
                }
            }

            _context.Entry(user).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!UserExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        private bool IsBCryptHash(string password)
        {
            return password.StartsWith("$2a$") || password.StartsWith("$2b$") || password.StartsWith("$2y$");
        }

        private bool UserExists(string id)
        {
            return _context.Users.Any(e => e.Id == id);
        }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

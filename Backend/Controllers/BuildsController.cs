using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PcGarage.Api.Data;
using PcGarage.Api.Models;

namespace PcGarage.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuildsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BuildsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Builds
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Build>>> GetBuilds([FromQuery] string? userId = null)
        {
            var query = _context.Builds
                .Include(b => b.Cpu)
                .Include(b => b.Gpu)
                .Include(b => b.Motherboard)
                .Include(b => b.Ram)
                .Include(b => b.Psu)
                .Include(b => b.Case)
                .Include(b => b.Cooling)
                .Include(b => b.Storages)
                    .ThenInclude(bs => bs.Product)
                .AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(b => b.UserId == userId);
            }

            return await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        }

        // GET: api/Builds/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Build>> GetBuild(string id)
        {
            var build = await _context.Builds
                .Include(b => b.Cpu)
                .Include(b => b.Gpu)
                .Include(b => b.Motherboard)
                .Include(b => b.Ram)
                .Include(b => b.Psu)
                .Include(b => b.Case)
                .Include(b => b.Cooling)
                .Include(b => b.Storages)
                    .ThenInclude(bs => bs.Product)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (build == null)
            {
                return NotFound();
            }

            return build;
        }

        // POST: api/Builds
        [HttpPost]
        public async Task<ActionResult<Build>> SaveBuild(Build build)
        {
            build.CreatedAt = DateTime.UtcNow;

            _context.Builds.Add(build);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBuild), new { id = build.Id }, build);
        }

        // DELETE: api/Builds/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBuild(string id)
        {
            var build = await _context.Builds.FindAsync(id);
            if (build == null)
            {
                return NotFound();
            }

            _context.Builds.Remove(build);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

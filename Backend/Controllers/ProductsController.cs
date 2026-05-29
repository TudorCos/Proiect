using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PcGarage.Api.Data;
using PcGarage.Api.Models;

namespace PcGarage.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts([FromQuery] string? category = null)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category == category);
            }

            return await query.ToListAsync();
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(string id)
        {
            var product = await _context.Products
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            return product;
        }

        // POST: api/Products/{id}/reviews
        [HttpPost("{id}/reviews")]
        public async Task<ActionResult<Review>> CreateReview(string id, Review review)
        {
            if (id != review.ProductId)
            {
                return BadRequest(new { message = "Product ID mismatch." });
            }

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound(new { message = "Product not found." });
            }

            var user = await _context.Users.FindAsync(review.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            review.Id = Guid.NewGuid().ToString();
            review.CreatedAt = DateTime.UtcNow;
            review.UserName = user.Name;

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Re-calculate average rating and review count
            var reviews = await _context.Reviews.Where(r => r.ProductId == id).ToListAsync();
            product.ReviewCount = reviews.Count;
            product.Rating = reviews.Count > 0 ? (decimal)reviews.Average(r => r.Rating) : 0;

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, review);
        }

        // POST: api/Products
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // PUT: api/Products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(string id, Product product)
        {
            if (id != product.Id)
            {
                return BadRequest();
            }

            _context.Entry(product).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ProductExists(id))
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

        // DELETE: api/Products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ProductExists(string id)
        {
            return _context.Products.Any(e => e.Id == id);
        }
    }
}

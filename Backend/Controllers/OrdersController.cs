using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PcGarage.Api.Data;
using PcGarage.Api.Models;
using PcGarage.Api.Services;

namespace PcGarage.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public OrdersController(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/Orders
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetOrders([FromQuery] string? userId = null)
        {
            var query = _context.Orders
                .Include(o => o.Items)
                .AsQueryable();

            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(o => o.UserId == userId);
            }

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrder(string id)
        {
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return order;
        }

        // POST: api/Orders
        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            // Set timestamps
            order.CreatedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            // Decrement stock for each item securely on the server side
            foreach (var item in order.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    product.Stock = Math.Max(0, product.Stock - item.Quantity);
                    // EF Core will track this modification
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Send confirmation email
            var user = await _context.Users.FindAsync(order.UserId);
            if (user != null)
            {
                try
                {
                    await _emailService.SendOrderConfirmationEmailAsync(user.Email, user.Name, order);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[EMAIL ERROR] Failed to send email: {ex.Message}");
                }
            }

            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }

        // PUT: api/Orders/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(string id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

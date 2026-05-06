using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PcGarage.Api.Models
{
    public class Order
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        public User? User { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }

        public string Status { get; set; } = "pending";

        public Address ShippingAddress { get; set; } = new Address();

        public string PaymentMethod { get; set; } = "ramburs";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class OrderItem
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string OrderId { get; set; } = string.Empty;

        public Order? Order { get; set; }

        [Required]
        public string ProductId { get; set; } = string.Empty;

        public Product? Product { get; set; }

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int Quantity { get; set; }
    }
}

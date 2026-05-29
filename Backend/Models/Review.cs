using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PcGarage.Api.Models
{
    public class Review
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string ProductId { get; set; } = string.Empty;

        [ForeignKey("ProductId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public Product? Product { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        [System.Text.Json.Serialization.JsonIgnore]
        public User? User { get; set; }

        public string? UserName { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PcGarage.Api.Models
{
    public class Product
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Brand { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int Stock { get; set; }

        public string Image { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(3,2)")]
        public decimal Rating { get; set; }

        public int ReviewCount { get; set; }

        public bool Featured { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [System.Text.Json.Serialization.JsonIgnore]
        public string? SpecsJson { get; set; }

        [NotMapped]
        public object? Specs 
        { 
            get => SpecsJson == null ? null : System.Text.Json.JsonSerializer.Deserialize<object>(SpecsJson); 
            set => SpecsJson = value == null ? null : System.Text.Json.JsonSerializer.Serialize(value); 
        }

        public ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}

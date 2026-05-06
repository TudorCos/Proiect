using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PcGarage.Api.Models
{
    public class Build
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string UserId { get; set; } = string.Empty;

        public User? User { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        // Foreign keys to single components
        public string? CpuId { get; set; }
        public Product? Cpu { get; set; }

        public string? GpuId { get; set; }
        public Product? Gpu { get; set; }

        public string? MotherboardId { get; set; }
        public Product? Motherboard { get; set; }

        public string? RamId { get; set; }
        public Product? Ram { get; set; }

        public string? PsuId { get; set; }
        public Product? Psu { get; set; }

        public string? CaseId { get; set; }
        public Product? Case { get; set; }

        public string? CoolingId { get; set; }
        public Product? Cooling { get; set; }

        // Navigation property for multiple storage devices
        public ICollection<BuildStorage> Storages { get; set; } = new List<BuildStorage>();

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public bool IsCompatible { get; set; }

        // JSON string to hold an array of compatibility issues
        public string? CompatibilityIssuesJson { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? SavedAt { get; set; }
    }

    // Join table for Build and Storage Products
    public class BuildStorage
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string BuildId { get; set; } = string.Empty;
        public Build? Build { get; set; }

        [Required]
        public string ProductId { get; set; } = string.Empty;
        public Product? Product { get; set; }
    }
}

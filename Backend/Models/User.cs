using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PcGarage.Api.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Role { get; set; } = "customer";

        public string Password { get; set; } = string.Empty;

        public string? Avatar { get; set; }

        public string? Phone { get; set; }

        public Address? Address { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    [Owned]
    public class Address
    {
        public string? Street { get; set; }
        public string? City { get; set; }
        public string? County { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
    }
}

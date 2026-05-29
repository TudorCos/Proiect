using Microsoft.EntityFrameworkCore;
using PcGarage.Api.Models;

namespace PcGarage.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Build> Builds { get; set; }
        public DbSet<BuildStorage> BuildStorages { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Review relationships
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Product)
                .WithMany(p => p.Reviews)
                .HasForeignKey(r => r.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure User -> Address (Owned Entity)
            modelBuilder.Entity<User>().OwnsOne(u => u.Address);

            // Configure Order -> OrderItems
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Build -> User
            modelBuilder.Entity<Build>()
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Build components (to prevent multiple cascade paths)
            modelBuilder.Entity<Build>()
                .HasOne(b => b.Cpu).WithMany().HasForeignKey(b => b.CpuId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Build>()
                .HasOne(b => b.Gpu).WithMany().HasForeignKey(b => b.GpuId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Build>()
                .HasOne(b => b.Motherboard).WithMany().HasForeignKey(b => b.MotherboardId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Build>()
                .HasOne(b => b.Ram).WithMany().HasForeignKey(b => b.RamId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Build>()
                .HasOne(b => b.Psu).WithMany().HasForeignKey(b => b.PsuId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Build>()
                .HasOne(b => b.Case).WithMany().HasForeignKey(b => b.CaseId).OnDelete(DeleteBehavior.NoAction);
            modelBuilder.Entity<Build>()
                .HasOne(b => b.Cooling).WithMany().HasForeignKey(b => b.CoolingId).OnDelete(DeleteBehavior.NoAction);

            // Configure Build -> BuildStorage
            modelBuilder.Entity<BuildStorage>()
                .HasOne(bs => bs.Build)
                .WithMany(b => b.Storages)
                .HasForeignKey(bs => bs.BuildId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<BuildStorage>()
                .HasOne(bs => bs.Product)
                .WithMany()
                .HasForeignKey(bs => bs.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

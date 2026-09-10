using Aegis.Api.Endpoints.Users.Data;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Data;

public static class AegisUserSeed
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AegisDbContext>();

        // Seed roles if none exist
        if (!await db.Roles.AnyAsync())
        {
            db.Roles.AddRange(
                new Role
                {
                    Id = Guid.NewGuid(),
                    Name = "Admin",
                    Description = "System administrator with full access.",
                    CreatedAt = DateTimeOffset.UtcNow,
                },
                new Role
                {
                    Id = Guid.NewGuid(),
                    Name = "Professor",
                    Description = "Faculty professor.",
                    CreatedAt = DateTimeOffset.UtcNow,
                },
                new Role
                {
                    Id = Guid.NewGuid(),
                    Name = "Student",
                    Description = "Faculty student.",
                    CreatedAt = DateTimeOffset.UtcNow,
                });

            await db.SaveChangesAsync();
        }

        // Seed admin user if not exists
        if (!await db.Users.AnyAsync(u => u.Email == "admin@aegis.com"))
        {
            var adminRole = await db.Roles.FirstAsync(r => r.Name == "Admin");

            var admin = new User
            {
                Id = Guid.NewGuid(),
                Email = "admin@aegis.com",
                DisplayName = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234!"),
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Users.Add(admin);

            // Assign Admin role (needs a group - create a default one if none exists)
            var defaultGroup = await db.Groups.FirstOrDefaultAsync();
            if (defaultGroup is null)
            {
                defaultGroup = new Group
                {
                    Id = Guid.NewGuid(),
                    Name = "Default",
                    FacultyId = (await db.Faculties.FirstOrDefaultAsync())?.Id ?? Guid.NewGuid(),
                    Description = "Default system group.",
                    CreatedAt = DateTimeOffset.UtcNow,
                };
                db.Groups.Add(defaultGroup);
                await db.SaveChangesAsync();
            }

            db.UserRoles.Add(new GroupUserRole
            {
                Id = Guid.NewGuid(),
                UserId = admin.Id,
                GroupId = defaultGroup.Id,
                RoleId = adminRole.Id,
                AssignedAt = DateTimeOffset.UtcNow,
            });

            await db.SaveChangesAsync();
        }

        // Seed test student user if not exists
        if (!await db.Users.AnyAsync(u => u.Email == "student@aegis.com"))
        {
            var studentRole = await db.Roles.FirstAsync(r => r.Name == "Student");
            var defaultGroup = await db.Groups.FirstAsync();

            var student = new User
            {
                Id = Guid.NewGuid(),
                Email = "student@aegis.com",
                DisplayName = "Student",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Student1234!"),
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
            };

            db.Users.Add(student);
            await db.SaveChangesAsync();

            db.UserRoles.Add(new GroupUserRole
            {
                Id = Guid.NewGuid(),
                UserId = student.Id,
                GroupId = defaultGroup.Id,
                RoleId = studentRole.Id,
                AssignedAt = DateTimeOffset.UtcNow,
            });

            await db.SaveChangesAsync();
        }
    }
}

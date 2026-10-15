using Aegis.Api.Modules.Users.Features.CreateUser;

namespace Aegis.Api.Tests.Modules.Users.Features.CreateUser;

public sealed class CreateUserValidatorTests
{
    private readonly CreateUserValidator _validator = new();

    [Fact]
    public void Validate_ValidRequest_Passes()
    {
        var result = _validator.Validate(Request());

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("", "Email is required.")]
    [InlineData("not-an-email", "Invalid email address.")]
    public void Validate_InvalidEmail_Fails(string email, string expectedError)
    {
        var result = _validator.Validate(Request() with { Email = email });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == expectedError);
    }

    [Fact]
    public void Validate_TooLongEmail_Fails()
    {
        var result = _validator.Validate(Request() with { Email = $"{new string('a', 297)}@x.io" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Email must not exceed 300 characters.");
    }

    [Fact]
    public void Validate_EmptyDisplayName_Fails()
    {
        var result = _validator.Validate(Request() with { DisplayName = "" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Display name is required.");
    }

    [Fact]
    public void Validate_ShortPassword_Fails()
    {
        var result = _validator.Validate(Request() with { Password = "short" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Password must be at least 8 characters.");
    }

    private static CreateUserRequest Request() => new()
    {
        Email = "user@aegis.dev",
        DisplayName = "Test User",
        Password = "long-enough-password",
    };
}

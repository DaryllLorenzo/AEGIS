using Aegis.Api.Modules.Users.Features.Login;

namespace Aegis.Api.Tests.Modules.Users.Features.Login;

public sealed class LoginValidatorTests
{
    private readonly LoginValidator _validator = new();

    [Theory]
    [InlineData("", "Email is required.")]
    [InlineData("not-an-email", "Invalid email address.")]
    [InlineData("user@aegis.dev", null)]
    public void Validate_EmailRules(string email, string? expectedError)
    {
        var result = _validator.Validate(
            new LoginRequest { Email = email, Password = "secret" });

        Assert.Equal(expectedError is null, result.IsValid);
        if (expectedError is not null)
        {
            Assert.Contains(result.Errors, e => e.ErrorMessage == expectedError);
        }
    }

    [Fact]
    public void Validate_EmptyPassword_Fails()
    {
        var result = _validator.Validate(
            new LoginRequest { Email = "user@aegis.dev", Password = "" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.ErrorMessage == "Password is required.");
    }
}

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Aegis.Email;

public static class EmailServiceCollectionExtensions
{
    /// <summary>
    /// Registers IEmailSender backed by SMTP with config from the
    /// Email:Smtp section (override via Email__Smtp__* env vars).
    /// </summary>
    public static IServiceCollection AddEmail(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<EmailOptions>()
            .Bind(configuration.GetSection(EmailOptions.SectionName))
            .Validate(
                o => string.IsNullOrWhiteSpace(o.Host) || !string.IsNullOrWhiteSpace(o.From),
                "Email:Smtp:From is required when Email:Smtp:Host is configured.")
            .ValidateOnStart();

        services.AddScoped<IEmailSender, SmtpEmailSender>();
        return services;
    }
}

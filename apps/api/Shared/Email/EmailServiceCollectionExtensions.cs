using Microsoft.Extensions.Options;

namespace Aegis.Api.Shared.Email;

public static class EmailServiceCollectionExtensions
{
    /// <summary>
    /// Registers IEmailSender backed by SMTP with config from the
    /// Email:Smtp section (override via Email__Smtp__* env vars).
    /// </summary>
    public static IServiceCollection AddEmail(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        return services;
    }
}

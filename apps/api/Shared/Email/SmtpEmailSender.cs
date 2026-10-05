using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace Aegis.Api.Shared.Email;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly IOptions<EmailOptions> _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options;
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var opts = _options.Value;

        // SMTP not configured (e.g. running outside Aspire locally): skip cleanly.
        if (string.IsNullOrWhiteSpace(opts.Host))
        {
            _logger.LogWarning(
                "Email skipped — Email:Smtp:Host is not configured. {To} → {Subject}",
                message.To, message.Subject);
            return;
        }

        using var smtp = new SmtpClient(opts.Host, opts.Port)
        {
            EnableSsl = opts.EnableSsl,
        };

        using var mail = new MailMessage
        {
            From = new MailAddress(opts.From),
            Subject = message.Subject,
            Body = message.Body,
            IsBodyHtml = true,
        };
        mail.To.Add(message.To);

        await smtp.SendMailAsync(mail);
        _logger.LogInformation("Email sent to {To}: {Subject}", message.To, message.Subject);
    }
}

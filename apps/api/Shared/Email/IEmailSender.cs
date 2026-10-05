namespace Aegis.Api.Shared.Email;

/// <summary>A single-recipient email payload.</summary>
public sealed record EmailMessage(string To, string Subject, string Body);

/// <summary>
/// Sends application emails (group member notifications, review
/// reminders, etc.). Implementation detail is SMTP/options-bound,
/// so handlers never deal with SmtpClient/MailMessage boilerplate.
/// </summary>
public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default);
}

using Aegis.Api.Data;

namespace Aegis.Api.Modules.Users.Services;

/// <summary>
/// Deletes expired refresh tokens on a daily timer so the table does not grow unbounded.
/// </summary>
public sealed partial class RefreshTokenCleanupService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromHours(24);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<RefreshTokenCleanupService> _logger;

    public RefreshTokenCleanupService(
        IServiceScopeFactory scopeFactory,
        ILogger<RefreshTokenCleanupService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(Interval);

        do
        {
            try
            {
                await CleanupAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                LogCleanupFailed(_logger, ex);
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task CleanupAsync(CancellationToken ct)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var refreshTokens = scope.ServiceProvider.GetRequiredService<RefreshTokenService>();

        await refreshTokens.CleanupExpiredTokensAsync(ct);
    }

    [LoggerMessage(1, LogLevel.Error, "Refresh token cleanup failed.")]
    private static partial void LogCleanupFailed(ILogger logger, Exception exception);
}

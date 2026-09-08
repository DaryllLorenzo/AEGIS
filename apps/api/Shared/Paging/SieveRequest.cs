using Sieve.Models;

namespace Aegis.Api.Shared.Paging;

public record SieveRequest
{
    public SieveModel Sieve { get; init; } = new();
}

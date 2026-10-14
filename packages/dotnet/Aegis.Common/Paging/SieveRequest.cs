using Sieve.Models;

namespace Aegis.Common.Paging;

public record SieveRequest
{
    public SieveModel Sieve { get; init; } = new();
}

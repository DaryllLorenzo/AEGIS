using Sieve.Models;

namespace Aegis.Api.Common.Paging;

public record SieveRequest
{
    public SieveModel Sieve { get; init; } = new();
}

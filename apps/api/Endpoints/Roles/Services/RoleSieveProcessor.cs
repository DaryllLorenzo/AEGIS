using Aegis.Api.Endpoints.Roles.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Roles.Services;

public sealed class RoleSieveProcessor : SieveProcessor
{
    public RoleSieveProcessor(IOptions<SieveOptions> options)
        : base(options)
    {
    }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<Role>(r => r.Name)
            .CanFilter()
            .CanSort();

        mapper.Property<Role>(r => r.CreatedAt)
            .CanSort();

        return mapper;
    }
}

using Aegis.Api.Endpoints.Users.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Users.Services;

public sealed class GroupSieveProcessor : SieveProcessor
{
    public GroupSieveProcessor(IOptions<SieveOptions> options)
        : base(options)
    {
    }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<Group>(g => g.Name)
            .CanFilter()
            .CanSort();

        mapper.Property<Group>(g => g.FacultyId)
            .CanFilter();

        mapper.Property<Group>(g => g.CreatedAt)
            .CanSort();

        return mapper;
    }
}

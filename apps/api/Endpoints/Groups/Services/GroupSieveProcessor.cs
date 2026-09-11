using Aegis.Api.Endpoints.Groups.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Groups.Services;

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

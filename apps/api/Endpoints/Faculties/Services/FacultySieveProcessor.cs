using Aegis.Api.Endpoints.Faculties.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Faculties.Services;

public sealed class FacultySieveProcessor : SieveProcessor
{
    public FacultySieveProcessor(IOptions<SieveOptions> options)
        : base(options)
    {
    }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<Faculty>(f => f.Name)
            .CanFilter()
            .CanSort();

        mapper.Property<Faculty>(f => f.Code)
            .CanFilter()
            .CanSort();

        mapper.Property<Faculty>(f => f.IsActive)
            .CanFilter();

        mapper.Property<Faculty>(f => f.CreatedAt)
            .CanSort();

        return mapper;
    }
}

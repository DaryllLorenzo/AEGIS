using Aegis.Api.Endpoints.Documents.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Documents.Services;

public sealed class DocumentSieveProcessor : SieveProcessor
{
    public DocumentSieveProcessor(IOptions<SieveOptions> options)
        : base(options)
    {
    }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<Document>(d => d.Name)
            .CanFilter()
            .CanSort();

        mapper.Property<Document>(d => d.ParentId)
            .CanFilter();

        mapper.Property<Document>(d => d.MimeType)
            .CanFilter();

        mapper.Property<Document>(d => d.IsActive)
            .CanFilter();

        mapper.Property<Document>(d => d.CreatedAt)
            .CanSort();

        return mapper;
    }
}

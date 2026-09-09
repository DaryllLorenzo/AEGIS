using Aegis.Api.Endpoints.Reviews.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Reviews.Services;

public sealed class ReviewSieveProcessor : SieveProcessor
{
    public ReviewSieveProcessor(IOptions<SieveOptions> options)
        : base(options)
    {
    }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<Review>(r => r.Title)
            .CanFilter()
            .CanSort();

        mapper.Property<Review>(r => r.DocumentId)
            .CanFilter();

        mapper.Property<Review>(r => r.Status)
            .CanFilter()
            .CanSort();

        mapper.Property<Review>(r => r.Assignee)
            .CanFilter();

        mapper.Property<Review>(r => r.IsActive)
            .CanFilter();

        mapper.Property<Review>(r => r.CreatedAt)
            .CanSort();

        mapper.Property<Review>(r => r.DueDate)
            .CanSort();

        return mapper;
    }
}

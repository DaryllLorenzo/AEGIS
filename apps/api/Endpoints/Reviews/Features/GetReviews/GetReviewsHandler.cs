using Aegis.Api.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Mappings;
using Aegis.Api.Endpoints.Reviews.Services;
using Aegis.Api.Shared.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Endpoints.Reviews.Features.GetReviews;

public sealed class GetReviewsHandler : IRequestHandler<GetReviewsRequest, PaginatedList<ReviewDto>>
{
    private readonly AegisDbContext _db;
    private readonly ReviewSieveProcessor _sieve;

    public GetReviewsHandler(AegisDbContext db, ReviewSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<ReviewDto>> Handle(GetReviewsRequest request, CancellationToken ct)
    {
        var query = _db.Reviews.AsQueryable();

        if (request.GroupId.HasValue)
        {
            query = query.Where(r => _db.Documents
                .Any(d => d.Id == r.DocumentId && d.GroupId == request.GroupId.Value));
        }

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(ct);

        var items = await paged
            .Select(r => r.ToDto())
            .ToListAsync(ct);

        return new PaginatedList<ReviewDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}

using Aegis.Api.Data;
using Aegis.Api.Modules.Reviews.Dtos;
using Aegis.Api.Modules.Reviews.Mappings;
using Aegis.Api.Modules.Reviews.Services;
using Aegis.Common.Paging;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Aegis.Api.Modules.Reviews.Features.GetReviews;

public sealed class GetReviewsHandler : IRequestHandler<GetReviewsRequest, PaginatedList<ReviewDto>>
{
    private readonly AegisDbContext _db;
    private readonly ReviewSieveProcessor _sieve;

    public GetReviewsHandler(AegisDbContext db, ReviewSieveProcessor sieve)
    {
        _db = db;
        _sieve = sieve;
    }

    public async Task<PaginatedList<ReviewDto>> Handle(GetReviewsRequest request, CancellationToken cancellationToken)
    {
        var query = _db.Reviews
            .Include(r => r.AssigneeUser)
            .AsQueryable();

        if (request.GroupId.HasValue)
        {
            query = query.Where(r => _db.Documents
                .Any(d => d.Id == r.DocumentId && d.GroupId == request.GroupId.Value));
        }

        var paged = _sieve.Apply(request.Sieve, query);

        var totalCount = await paged.CountAsync(cancellationToken);

        var items = await paged
            .Select(r => r.ToDto())
            .ToListAsync(cancellationToken);

        return new PaginatedList<ReviewDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Sieve.Page ?? 1,
            PageSize = request.Sieve.PageSize ?? 10,
        };
    }
}

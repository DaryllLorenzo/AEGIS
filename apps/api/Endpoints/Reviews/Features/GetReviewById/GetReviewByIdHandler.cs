using Aegis.Api.Data;
using Aegis.Api.Endpoints.Reviews.Dtos;
using Aegis.Api.Endpoints.Reviews.Exceptions;
using Aegis.Api.Endpoints.Reviews.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Reviews.Features.GetReviewById;

public sealed class GetReviewByIdHandler : IRequestHandler<GetReviewByIdRequest, ReviewDto>
{
    private readonly AegisDbContext _db;

    public GetReviewByIdHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<ReviewDto> Handle(GetReviewByIdRequest request, CancellationToken ct)
    {
        var review = await _db.Reviews.FindAsync([request.Id], ct)
            ?? throw new ReviewNotFoundException(request.Id);

        return review.ToDto();
    }
}

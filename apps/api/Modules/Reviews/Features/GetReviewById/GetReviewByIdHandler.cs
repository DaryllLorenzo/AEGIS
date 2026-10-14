using Aegis.Api.Data;
using Aegis.Api.Modules.Reviews.Dtos;
using Aegis.Api.Modules.Reviews.Mappings;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Reviews.Features.GetReviewById;

public sealed class GetReviewByIdHandler : IRequestHandler<GetReviewByIdRequest, Result<ReviewDto>>
{
    private readonly AegisDbContext _db;

    public GetReviewByIdHandler(AegisDbContext db)
    {
        _db = db;
    }

    public async Task<Result<ReviewDto>> Handle(GetReviewByIdRequest request, CancellationToken cancellationToken)
    {
        var review = await _db.Reviews.FindAsync([request.Id], cancellationToken);

        if (review is null)
        {
            return Error.NotFound("Review.NotFound", $"Review with ID '{request.Id}' was not found.");
        }

        return review.ToDto();
    }
}

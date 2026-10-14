using Aegis.Api.Data;
using Aegis.Api.Modules.Groups.Data;
using Aegis.Api.Modules.Groups.Dtos;
using Aegis.Api.Modules.Groups.Mappings;
using Aegis.Common.Result;
using MediatR;

namespace Aegis.Api.Modules.Groups.Features.GetGroupById;

public sealed class GetGroupByIdHandler : IRequestHandler<GetGroupByIdRequest, Result<GroupDto>>
{
    private readonly AegisDbContext _db;

    public GetGroupByIdHandler(AegisDbContext db) => _db = db;

    public async Task<Result<GroupDto>> Handle(GetGroupByIdRequest request, CancellationToken cancellationToken)
    {
        var group = await _db.Groups.FindAsync([request.Id], cancellationToken);

        if (group is null)
        {
            return Error.NotFound("Group.NotFound", $"Group with ID '{request.Id}' was not found.");
        }

        return group.ToDto();
    }
}

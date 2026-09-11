using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Exceptions;
using Aegis.Api.Endpoints.Groups.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Groups.Features.GetGroupById;

public sealed class GetGroupByIdHandler : IRequestHandler<GetGroupByIdRequest, GroupDto>
{
    private readonly AegisDbContext _db;

    public GetGroupByIdHandler(AegisDbContext db) => _db = db;

    public async Task<GroupDto> Handle(GetGroupByIdRequest request, CancellationToken ct)
    {
        var group = await _db.Groups.FindAsync([request.Id], ct)
            ?? throw new GroupNotFoundException(request.Id);

        return group.ToDto();
    }
}

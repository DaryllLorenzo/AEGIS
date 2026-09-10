using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Exceptions;
using Aegis.Api.Endpoints.Users.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.GetGroupById;

public sealed class GetGroupByIdHandler : IRequestHandler<GetGroupByIdRequest, GroupDto>
{
    private readonly AegisDbContext _db;

    public GetGroupByIdHandler(AegisDbContext db) => _db = db;

    public async Task<GroupDto> Handle(GetGroupByIdRequest request, CancellationToken ct)
    {
        var group = await _db.Groups.FindAsync([request.Id], ct)
            ?? throw new UserNotFoundException(request.Id);

        return group.ToDto();
    }
}

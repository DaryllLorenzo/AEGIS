using Aegis.Api.Data;
using Aegis.Api.Endpoints.Users.Data;
using Aegis.Api.Endpoints.Users.Dtos;
using Aegis.Api.Endpoints.Users.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Users.Features.CreateGroup;

public sealed class CreateGroupHandler : IRequestHandler<CreateGroupRequest, GroupDto>
{
    private readonly AegisDbContext _db;

    public CreateGroupHandler(AegisDbContext db) => _db = db;

    public async Task<GroupDto> Handle(CreateGroupRequest request, CancellationToken ct)
    {
        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            FacultyId = request.FacultyId,
            Description = request.Description,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        _db.Groups.Add(group);
        await _db.SaveChangesAsync(ct);

        return group.ToDto();
    }
}

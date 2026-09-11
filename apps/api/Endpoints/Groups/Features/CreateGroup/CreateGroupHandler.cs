using Aegis.Api.Data;
using Aegis.Api.Endpoints.Groups.Data;
using Aegis.Api.Endpoints.Groups.Dtos;
using Aegis.Api.Endpoints.Groups.Mappings;
using MediatR;

namespace Aegis.Api.Endpoints.Groups.Features.CreateGroup;

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

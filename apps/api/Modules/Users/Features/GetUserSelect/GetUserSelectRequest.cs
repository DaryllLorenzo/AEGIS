using Aegis.Common.Selection;
using MediatR;

namespace Aegis.Api.Modules.Users.Features.GetUserSelect;

public sealed record GetUserSelectRequest : IRequest<List<SelectItemDto>>
{
    /// <summary>When set, only members of this group are returned.</summary>
    public Guid? GroupId { get; init; }

    /// <summary>Optional case-insensitive search over DisplayName and Email.</summary>
    public string? Search { get; init; }
}

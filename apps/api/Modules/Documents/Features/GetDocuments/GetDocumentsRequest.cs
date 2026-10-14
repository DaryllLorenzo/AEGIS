using Aegis.Api.Modules.Documents.Dtos;
using Aegis.Common.Paging;
using MediatR;

namespace Aegis.Api.Modules.Documents.Features.GetDocuments;

public sealed record GetDocumentsRequest : SieveRequest, IRequest<PaginatedList<DocumentDto>>
{
    public Guid? GroupId { get; init; }
}

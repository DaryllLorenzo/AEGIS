using Aegis.Api.Endpoints.Documents.Dtos;
using Aegis.Api.Shared.Paging;
using MediatR;

namespace Aegis.Api.Endpoints.Documents.Features.GetDocuments;

public sealed record GetDocumentsRequest : SieveRequest, IRequest<PaginatedList<DocumentDto>>
{
    public Guid? GroupId { get; init; }
}

using Aegis.Api.Endpoints.Annotations.Dtos;
using MediatR;

namespace Aegis.Api.Endpoints.Annotations.Features.GetAnnotationsByDocumentId;

public sealed record GetAnnotationsByDocumentIdRequest(Guid DocumentId) : IRequest<List<AnnotationDto>>;

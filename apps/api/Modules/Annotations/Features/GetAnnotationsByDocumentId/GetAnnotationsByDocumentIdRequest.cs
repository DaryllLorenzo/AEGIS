using Aegis.Api.Modules.Annotations.Dtos;
using MediatR;

namespace Aegis.Api.Modules.Annotations.Features.GetAnnotationsByDocumentId;

public sealed record GetAnnotationsByDocumentIdRequest(Guid DocumentId) : IRequest<List<AnnotationDto>>;

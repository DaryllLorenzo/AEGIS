using Aegis.Api.Modules.Faculties.Features.CreateFaculty;
using Aegis.Api.Modules.Faculties.Features.DeleteFaculty;
using Aegis.Api.Modules.Faculties.Features.GetFaculties;
using Aegis.Api.Modules.Faculties.Features.GetFacultyById;
using Aegis.Api.Modules.Faculties.Features.UpdateFaculty;
using Aegis.Api.Modules.Faculties.Services;

namespace Aegis.Api.Modules.Faculties;

internal static class FacultiesConfigurations
{
    public const string Tag = "Faculties";
    public const string FacultiesPrefixUri = "api/faculties";

    internal static WebApplicationBuilder AddFacultiesModuleServices(this WebApplicationBuilder builder)
    {
        builder.Services.AddScoped<FacultySieveProcessor>();

        return builder;
    }

    internal static IEndpointRouteBuilder MapFacultiesModuleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var faculties = endpoints.MapGroup(FacultiesPrefixUri);

        faculties.MapGetFacultiesEndpoint();
        faculties.MapGetFacultyByIdEndpoint();
        faculties.MapCreateFacultyEndpoint();
        faculties.MapUpdateFacultyEndpoint();
        faculties.MapDeleteFacultyEndpoint();

        return endpoints;
    }
}

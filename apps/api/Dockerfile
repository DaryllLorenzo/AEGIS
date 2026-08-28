# Build context is the repository root: the API references libs/Aegis.ServiceDefaults.
# Build with:  docker build -f apps/api/Dockerfile .

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the manifests first so restore is cached until dependencies actually change.
COPY Directory.Build.props Directory.Packages.props global.json ./
COPY apps/api/Aegis.Api.csproj apps/api/
COPY libs/Aegis.ServiceDefaults/Aegis.ServiceDefaults.csproj libs/Aegis.ServiceDefaults/
RUN dotnet restore apps/api/Aegis.Api.csproj

COPY apps/api/ apps/api/
COPY libs/ libs/
RUN dotnet publish apps/api/Aegis.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# The base image ships no HTTP client, and the compose healthcheck needs one.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Kestrel listens on 8080 as the non-root user defined by the base image.
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
USER $APP_UID

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Aegis.Api.dll"]

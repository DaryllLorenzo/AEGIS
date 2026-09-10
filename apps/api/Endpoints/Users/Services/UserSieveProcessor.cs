using Aegis.Api.Endpoints.Users.Data;
using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace Aegis.Api.Endpoints.Users.Services;

public sealed class UserSieveProcessor : SieveProcessor
{
    public UserSieveProcessor(IOptions<SieveOptions> options)
        : base(options)
    {
    }

    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper.Property<User>(u => u.Email)
            .CanFilter()
            .CanSort();

        mapper.Property<User>(u => u.DisplayName)
            .CanFilter()
            .CanSort();

        mapper.Property<User>(u => u.IsActive)
            .CanFilter();

        mapper.Property<User>(u => u.CreatedAt)
            .CanSort();

        return mapper;
    }
}

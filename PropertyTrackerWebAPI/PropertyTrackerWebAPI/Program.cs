using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PropertyTrackerWebAPI.EFDataContext;
using PropertyTrackerWebAPI.Repositories;
using PropertyTrackerWebAPI.Services;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("NeonDB")));

// Register services and repositories for dependency injection
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

builder.Services.AddHttpClient<GeocodingService>();
builder.Services.AddScoped<GeocodingService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudiences = builder.Configuration.GetSection("Jwt:Audiences").Get<string[]>()
    ?? new[] { builder.Configuration["Jwt:Audience"]! }, // with fallback
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        ClockSkew = TimeSpan.FromSeconds(30) // Add this line
    };

    // Debugging purposes
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully");
            return Task.CompletedTask;
        }
    };
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                // HTTP
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",   
                "http://localhost:5176",   
                "http://localhost:5177",   

                // HTTPS
                "https://localhost:5173",
                "https://localhost:5174",
                "https://localhost:5175",  
                "https://localhost:5176",  
                "https://localhost:5177")
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials(); // HTTPS variant
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    await SeedDatabaseAsync(app);
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use HTTPS redirection for secure communication
app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication(); // JWT authentication middleware
app.UseAuthorization();

app.MapControllers();

app.Run();

// This method seeds the database with initial data if it is empty.
async Task SeedDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var services = scope.ServiceProvider;

    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        await DatabaseSeeder.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}
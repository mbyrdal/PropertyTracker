using Microsoft.EntityFrameworkCore;
using PropertyTrackerWebAPI.EFDataContext;
using PropertyTrackerWebAPI.Repositories;
using PropertyTrackerWebAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("NeonDB")));

// Register services and repositories for dependency injection
builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
builder.Services.AddScoped<IPropertyService, PropertyService>();

builder.Services.AddHttpClient<GeocodingService>();
builder.Services.AddScoped<GeocodingService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
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

// Enable CORS to allow requests from any origin
app.UseCors(builder => builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader());

app.UseHttpsRedirection();

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
using Microsoft.EntityFrameworkCore;
using finalgame.Data;
using finalgame.Services;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. REGISTER SERVICES (builder.Services)
// ==========================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=mydata.db"));

// Enable Memory Caching for game states
builder.Services.AddMemoryCache();

// Register Phase 2 game services
builder.Services.AddScoped<IDeckService, DeckService>();

// Configure CORS Policy for the Angular frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ==========================================
// 2. BUILD THE APP (ONLY ONCE!)
// ==========================================
var app = builder.Build();

// ==========================================
// 3. CONFIGURE MIDDLEWARE PIPELINE (app.Use)
// ==========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

// Apply the CORS policy before routing and authorization
app.UseCors("AllowAngular");

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
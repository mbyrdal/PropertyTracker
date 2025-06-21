using System.Text.Json;

namespace PropertyTrackerWebAPI.Services
{
    public class GeocodingService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GeocodingService> _logger;

        public GeocodingService(HttpClient httpClient, ILogger<GeocodingService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<(double Lat, double Lng)?> GetCoordinatesAsync(string address)
        {
            try
            {
                var response = await _httpClient.GetAsync($"https://nominatim.openstreetmap.org/search?format=json&q{Uri.EscapeDataString(address)}");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var results = JsonSerializer.Deserialize<List<GeocodingResult>>(content);

                    if (results?.Count > 0)
                    {
                        return (Lat: double.Parse(results[0].Lat), Lng: double.Parse(results[0].Lon));
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching coordinates for address: {Address}", address);
                return null;
            }
        }

        private class GeocodingResult
        {
            public string Lat { get; set; }
            public string Lon { get; set; }
        }
    }
}

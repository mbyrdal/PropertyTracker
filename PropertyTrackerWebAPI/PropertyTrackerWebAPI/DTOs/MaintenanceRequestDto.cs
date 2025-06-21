namespace PropertyTrackerWebAPI.DTOs
{
    public class MaintenanceRequestDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } // "Open", "InProgress", "Completed"
    }
}

namespace PropertyTrackerWebAPI.DTOs
{
    public class TenantDetailDto
    {
        public PropertyDto Property { get; set; }
        public List<PaymentDto> PaymentHistory { get; set; } = new();
        public List<MaintenanceRequestDto> MaintenanceRequests { get; set; } = new();
    }
}

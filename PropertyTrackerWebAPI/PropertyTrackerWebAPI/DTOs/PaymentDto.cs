﻿namespace PropertyTrackerWebAPI.DTOs
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public int TenantId { get; set; }
    }
}
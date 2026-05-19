package immunizations

type CreateImmunizationRequest struct {
	VaccineName   string  `json:"vaccine_name" binding:"required,max=255"`
	ScheduledDate string  `json:"scheduled_date" binding:"required"`
	Location      *string `json:"location" binding:"omitempty,max=255"`
	Notes         *string `json:"notes" binding:"omitempty,max=2000"`
}

type UpdateImmunizationRequest struct {
	VaccineName   *string `json:"vaccine_name" binding:"omitempty,max=255"`
	ScheduledDate *string `json:"scheduled_date"`
	CompletedDate *string `json:"completed_date"`
	Status        *string `json:"status" binding:"omitempty,oneof=pending completed missed"`
	Location      *string `json:"location" binding:"omitempty,max=255"`
	Notes         *string `json:"notes" binding:"omitempty,max=2000"`
}

package reminders

type CreateReminderRequest struct {
	Title      string `json:"title" binding:"required,max=255"`
	Type       string `json:"type" binding:"required,oneof=feeding medicine immunization custom"`
	RemindAt   string `json:"remind_at" binding:"required"`
	RepeatRule string `json:"repeat_rule" binding:"omitempty,oneof=none daily weekly custom"`
}

type UpdateReminderRequest struct {
	Title      *string `json:"title" binding:"omitempty,max=255"`
	Type       *string `json:"type" binding:"omitempty,oneof=feeding medicine immunization custom"`
	RemindAt   *string `json:"remind_at"`
	RepeatRule *string `json:"repeat_rule" binding:"omitempty,oneof=none daily weekly custom"`
	IsDone     *bool   `json:"is_done"`
	IsActive   *bool   `json:"is_active"`
}

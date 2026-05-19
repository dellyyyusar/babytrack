package activities

import "encoding/json"

type CreateActivityRequest struct {
	Type            string          `json:"type" binding:"required,oneof=feeding sleep diaper growth medicine temperature note"`
	StartedAt       string          `json:"started_at" binding:"required"`
	EndedAt         *string          `json:"ended_at"`
	DurationMinutes *int            `json:"duration_minutes"`
	Metadata        json.RawMessage `json:"metadata"`
	Notes           *string         `json:"notes" binding:"omitempty,max=2000"`
}

type UpdateActivityRequest struct {
	Type            *string          `json:"type" binding:"omitempty,oneof=feeding sleep diaper growth medicine temperature note"`
	StartedAt       *string          `json:"started_at"`
	EndedAt         *string          `json:"ended_at"`
	DurationMinutes *int             `json:"duration_minutes"`
	Metadata        json.RawMessage  `json:"metadata"`
	Notes           *string          `json:"notes" binding:"omitempty,max=2000"`
}

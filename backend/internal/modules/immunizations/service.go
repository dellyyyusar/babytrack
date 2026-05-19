package immunizations

import (
	"context"
	"time"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(ctx context.Context, babyID string, req CreateImmunizationRequest) (*Immunization, error) {
	return s.repo.Create(ctx, babyID, req.VaccineName, req.ScheduledDate, req.Location, req.Notes)
}

func (s *Service) List(ctx context.Context, babyID string) ([]Immunization, error) {
	return s.repo.ListByBaby(ctx, babyID)
}

func (s *Service) Update(ctx context.Context, id string, req UpdateImmunizationRequest) (*Immunization, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	vaccineName := existing.VaccineName
	scheduledDate := existing.ScheduledDate.Format("2006-01-02")
	completedDate := existing.CompletedDate
	status := existing.Status
	location := existing.Location
	notes := existing.Notes

	if req.VaccineName != nil {
		vaccineName = *req.VaccineName
	}
	if req.ScheduledDate != nil {
		scheduledDate = *req.ScheduledDate
	}
	if req.CompletedDate != nil {
		t, err := time.Parse("2006-01-02", *req.CompletedDate)
		if err == nil {
			completedDate = &t
		}
	}
	if req.Status != nil {
		status = *req.Status
	}
	if req.Location != nil {
		location = req.Location
	}
	if req.Notes != nil {
		notes = req.Notes
	}

	return s.repo.Update(ctx, id, vaccineName, scheduledDate, completedDate, status, location, notes)
}

func (s *Service) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

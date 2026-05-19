package reminders

import (
	"context"
	"errors"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

var (
	ErrNoAccess = errors.New("you don't have access to this reminder")
)

func (s *Service) Create(ctx context.Context, babyID, userID string, req CreateReminderRequest) (*Reminder, error) {
	repeatRule := req.RepeatRule
	if repeatRule == "" {
		repeatRule = "none"
	}
	return s.repo.Create(ctx, babyID, userID, req.Title, req.Type, req.RemindAt, repeatRule)
}

func (s *Service) List(ctx context.Context, babyID string) ([]Reminder, error) {
	return s.repo.ListByBaby(ctx, babyID)
}

func (s *Service) Update(ctx context.Context, id, userID string, req UpdateReminderRequest) (*Reminder, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if existing.UserID != userID {
		return nil, ErrNoAccess
	}

	title := existing.Title
	reminderType := existing.Type
	remindAt := existing.RemindAt.Format("2006-01-02T15:04:05Z")
	repeatRule := existing.RepeatRule
	isDone := existing.IsDone
	isActive := existing.IsActive

	if req.Title != nil {
		title = *req.Title
	}
	if req.Type != nil {
		reminderType = *req.Type
	}
	if req.RemindAt != nil {
		remindAt = *req.RemindAt
	}
	if req.RepeatRule != nil {
		repeatRule = *req.RepeatRule
	}
	if req.IsDone != nil {
		isDone = *req.IsDone
	}
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	return s.repo.Update(ctx, id, title, reminderType, remindAt, repeatRule, isDone, isActive)
}

func (s *Service) Delete(ctx context.Context, id, userID string) error {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if existing.UserID != userID {
		return ErrNoAccess
	}
	return s.repo.Delete(ctx, id)
}

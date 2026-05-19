package activities

import (
	"context"
	"errors"
	"strconv"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

var (
	ErrNoAccess     = errors.New("you don't have access to this activity")
	ErrNoPermission = errors.New("you don't have permission to perform this action")
)

type RoleChecker interface {
	GetMemberRole(ctx context.Context, babyID, userID string) (string, error)
}

func (s *Service) Create(ctx context.Context, babyID, userID string, req CreateActivityRequest) (*Activity, error) {
	return s.repo.Create(ctx, babyID, userID, req.Type, req.StartedAt, req.EndedAt, req.DurationMinutes, req.Metadata, req.Notes)
}

func (s *Service) List(ctx context.Context, babyID, userID string, activityType, date, pageStr, limitStr string) ([]Activity, int, error) {
	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	return s.repo.ListByBaby(ctx, babyID, activityType, date, page, limit)
}

func (s *Service) Get(ctx context.Context, id string) (*Activity, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) Update(ctx context.Context, id, userID string, req UpdateActivityRequest) (*Activity, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	if existing.UserID != userID {
		return nil, ErrNoPermission
	}

	activityType := existing.Type
	startedAt := existing.StartedAt.Format("2006-01-02T15:04:05Z")
	var endedAtStr *string
	if existing.EndedAt != nil {
		s := existing.EndedAt.Format("2006-01-02T15:04:05Z")
		endedAtStr = &s
	}
	durationMinutes := existing.DurationMinutes
	metadata := existing.Metadata
	notes := existing.Notes

	if req.Type != nil {
		activityType = *req.Type
	}
	if req.StartedAt != nil {
		startedAt = *req.StartedAt
	}
	if req.EndedAt != nil {
		endedAtStr = req.EndedAt
	}
	if req.DurationMinutes != nil {
		durationMinutes = req.DurationMinutes
	}
	if req.Metadata != nil {
		metadata = req.Metadata
	}
	if req.Notes != nil {
		notes = req.Notes
	}

	return s.repo.Update(ctx, id, activityType, startedAt, endedAtStr, durationMinutes, metadata, notes)
}

func (s *Service) Delete(ctx context.Context, id, userID string, roleChecker RoleChecker) error {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}

	role, _ := roleChecker.GetMemberRole(ctx, existing.BabyID, userID)
	if role == "owner" || role == "parent" || existing.UserID == userID {
		return s.repo.Delete(ctx, id)
	}

	return ErrNoPermission
}

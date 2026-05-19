package babies

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
	ErrNoAccess = errors.New("you don't have access to this baby")
	ErrNoPermission = errors.New("you don't have permission to perform this action")
)

func (s *Service) checkRole(ctx context.Context, babyID, userID string, allowedRoles ...string) error {
	role, err := s.repo.GetMemberRole(ctx, babyID, userID)
	if err != nil {
		return ErrNoAccess
	}
	for _, allowed := range allowedRoles {
		if role == allowed {
			return nil
		}
	}
	return ErrNoPermission
}

func (s *Service) Create(ctx context.Context, userID string, req CreateBabyRequest) (*Baby, error) {
	baby, err := s.repo.Create(ctx, req.Name, req.BirthDate, req.Gender, req.BirthWeight, req.BirthLength, req.BloodType, req.Notes)
	if err != nil {
		return nil, err
	}
	if err := s.repo.AddMember(ctx, baby.ID, userID, "owner"); err != nil {
		return nil, err
	}
	return baby, nil
}

func (s *Service) List(ctx context.Context, userID string) ([]Baby, error) {
	return s.repo.ListByUser(ctx, userID)
}

func (s *Service) Get(ctx context.Context, babyID, userID string) (*Baby, error) {
	if err := s.checkRole(ctx, babyID, userID, "owner", "parent", "caregiver", "viewer"); err != nil {
		return nil, err
	}
	return s.repo.GetByID(ctx, babyID)
}

func (s *Service) Update(ctx context.Context, babyID, userID string, req UpdateBabyRequest) (*Baby, error) {
	if err := s.checkRole(ctx, babyID, userID, "owner", "parent"); err != nil {
		return nil, err
	}

	baby, err := s.repo.GetByID(ctx, babyID)
	if err != nil {
		return nil, err
	}

	name := baby.Name
	birthDate := baby.BirthDate.Format("2006-01-02")
	gender := baby.Gender
	birthWeight := baby.BirthWeight
	birthLength := baby.BirthLength
	bloodType := baby.BloodType
	notes := baby.Notes

	if req.Name != nil {
		name = *req.Name
	}
	if req.BirthDate != nil {
		birthDate = *req.BirthDate
	}
	if req.Gender != nil {
		gender = *req.Gender
	}
	if req.BirthWeight != nil {
		birthWeight = req.BirthWeight
	}
	if req.BirthLength != nil {
		birthLength = req.BirthLength
	}
	if req.BloodType != nil {
		bloodType = req.BloodType
	}
	if req.Notes != nil {
		notes = req.Notes
	}

	return s.repo.Update(ctx, babyID, name, birthDate, gender, birthWeight, birthLength, bloodType, notes)
}

func (s *Service) Delete(ctx context.Context, babyID, userID string) error {
	if err := s.checkRole(ctx, babyID, userID, "owner"); err != nil {
		return err
	}
	return s.repo.Delete(ctx, babyID)
}

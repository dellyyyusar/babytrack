package auth

import (
	"context"
	"errors"
	"time"

	"github.com/beetrack/backend/internal/utils"
)

type Service struct {
	repo      *Repository
	jwtSecret string
}

func NewService(repo *Repository, jwtSecret string) *Service {
	return &Service{repo: repo, jwtSecret: jwtSecret}
}

var (
	ErrEmailExists    = errors.New("email already registered")
	ErrInvalidCreds   = errors.New("invalid email or password")
	ErrInvalidToken   = errors.New("invalid or expired refresh token")
)

func (s *Service) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	existing, _ := s.repo.GetUserByEmail(ctx, req.Email)
	if existing != nil {
		return nil, ErrEmailExists
	}

	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user, err := s.repo.CreateUser(ctx, req.FullName, req.Email, passwordHash)
	if err != nil {
		return nil, err
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	refreshToken, refreshHash, err := utils.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	err = s.repo.SaveRefreshToken(ctx, user.ID, refreshHash, time.Now().Add(7*24*time.Hour))
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User: UserResponse{
			ID:        user.ID,
			FullName:  user.FullName,
			Email:     user.Email,
			AvatarURL: user.AvatarURL,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, ErrInvalidCreds
	}

	if !utils.CheckPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCreds
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	refreshToken, refreshHash, err := utils.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	err = s.repo.SaveRefreshToken(ctx, user.ID, refreshHash, time.Now().Add(7*24*time.Hour))
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User: UserResponse{
			ID:        user.ID,
			FullName:  user.FullName,
			Email:     user.Email,
			AvatarURL: user.AvatarURL,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *Service) Refresh(ctx context.Context, req RefreshRequest) (*RefreshResponse, error) {
	tokenHash := utils.HashToken(req.RefreshToken)
	row, err := s.repo.GetRefreshToken(ctx, tokenHash)
	if err != nil {
		return nil, ErrInvalidToken
	}

	user, err := s.repo.GetUserByID(ctx, row.UserID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, s.jwtSecret)
	if err != nil {
		return nil, err
	}

	newRefresh, newHash, err := utils.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	s.repo.RevokeRefreshToken(ctx, tokenHash)
	s.repo.SaveRefreshToken(ctx, user.ID, newHash, time.Now().Add(7*24*time.Hour))

	return &RefreshResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefresh,
	}, nil
}

func (s *Service) Logout(ctx context.Context, userID string) error {
	return s.repo.RevokeUserRefreshTokens(ctx, userID)
}

package dashboard

import (
	"context"

	"github.com/beetrack/backend/internal/modules/activities"
)

type Service struct {
	activityRepo *activities.Repository
}

func NewService(activityRepo *activities.Repository) *Service {
	return &Service{activityRepo: activityRepo}
}

type DashboardSummary struct {
	TodayFeedingCount   int
	TodayFeedingMinutes int
	TodaySleepMinutes   int
	TodayDiaperCount    int
	LastFeeding         *activities.Activity
	LastSleep           *activities.Activity
	LastDiaper          *activities.Activity
}

func (s *Service) GetSummary(ctx context.Context, babyID string) (*DashboardSummary, error) {
	feedingCount, _ := s.activityRepo.GetTodayFeedingCount(ctx, babyID)
	feedingMinutes, _ := s.activityRepo.GetTodayFeedingMinutes(ctx, babyID)
	sleepMinutes, _ := s.activityRepo.GetTodaySleepMinutes(ctx, babyID)
	diaperCount, _ := s.activityRepo.GetTodayDiaperCount(ctx, babyID)

	lastFeeding, _ := s.activityRepo.GetLastActivityByType(ctx, babyID, "feeding")
	lastSleep, _ := s.activityRepo.GetLastActivityByType(ctx, babyID, "sleep")
	lastDiaper, _ := s.activityRepo.GetLastActivityByType(ctx, babyID, "diaper")

	return &DashboardSummary{
		TodayFeedingCount:   feedingCount,
		TodayFeedingMinutes: feedingMinutes,
		TodaySleepMinutes:   sleepMinutes,
		TodayDiaperCount:    diaperCount,
		LastFeeding:         lastFeeding,
		LastSleep:           lastSleep,
		LastDiaper:          lastDiaper,
	}, nil
}

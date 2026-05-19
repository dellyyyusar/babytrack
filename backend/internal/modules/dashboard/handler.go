package dashboard

import (
	"github.com/gin-gonic/gin"
	"github.com/beetrack/backend/internal/modules/activities"
	"github.com/beetrack/backend/internal/utils"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Summary(c *gin.Context) {
	babyID := c.Param("id")

	summary, err := h.svc.GetSummary(c.Request.Context(), babyID)
	if err != nil {
		utils.InternalError(c, "Failed to fetch dashboard summary")
		return
	}

	utils.Success(c, gin.H{
		"today_feeding_count":    summary.TodayFeedingCount,
		"today_feeding_minutes":  summary.TodayFeedingMinutes,
		"today_sleep_minutes":    summary.TodaySleepMinutes,
		"today_diaper_count":     summary.TodayDiaperCount,
		"last_feeding":           formatActivitySummary(summary.LastFeeding),
		"last_sleep":             formatActivitySummary(summary.LastSleep),
		"last_diaper":            formatActivitySummary(summary.LastDiaper),
		"upcoming_immunizations": []interface{}{},
	})
}

func formatActivitySummary(a *activities.Activity) *gin.H {
	if a == nil {
		return nil
	}
	return &gin.H{
		"id":               a.ID,
		"type":             a.Type,
		"started_at":       a.StartedAt,
		"ended_at":         a.EndedAt,
		"duration_minutes": a.DurationMinutes,
		"metadata":         a.Metadata,
		"notes":            a.Notes,
	}
}

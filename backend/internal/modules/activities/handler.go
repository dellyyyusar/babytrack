package activities

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/beetrack/backend/internal/modules/babies"
	"github.com/beetrack/backend/internal/utils"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	babyID := c.Param("id")
	userID := utils.GetUserID(c)

	activity, err := h.svc.Create(c.Request.Context(), babyID, userID, req)
	if err != nil {
		log.Printf("ERROR create activity: %v (babyID=%s, userID=%s, type=%s)", err, babyID, userID, req.Type)
		utils.InternalError(c, "Failed to create activity: "+err.Error())
		return
	}

	utils.Created(c, gin.H{
		"activity": formatActivity(activity),
	})
}

func (h *Handler) List(c *gin.Context) {
	babyID := c.Param("id")
	userID := utils.GetUserID(c)
	activityType := c.Query("type")
	date := c.Query("date")
	page := c.Query("page")
	limit := c.Query("limit")

	activities, total, err := h.svc.List(c.Request.Context(), babyID, userID, activityType, date, page, limit)
	if err != nil {
		log.Printf("ERROR list activities: %v (babyID=%s, type=%s, date=%s)", err, babyID, activityType, date)
		utils.InternalError(c, "Failed to fetch activities: "+err.Error())
		return
	}

	result := make([]gin.H, 0)
	for _, a := range activities {
		result = append(result, formatActivity(&a))
	}

	utils.Success(c, gin.H{
		"activities": result,
		"total":      total,
	})
}

func (h *Handler) Get(c *gin.Context) {
	id := c.Param("id")
	activity, err := h.svc.Get(c.Request.Context(), id)
	if err != nil {
		utils.NotFound(c, "Activity not found")
		return
	}

	utils.Success(c, gin.H{
		"activity": formatActivity(activity),
	})
}

func (h *Handler) Update(c *gin.Context) {
	var req UpdateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	id := c.Param("id")
	userID := utils.GetUserID(c)

	activity, err := h.svc.Update(c.Request.Context(), id, userID, req)
	if err != nil {
		if err == ErrNoPermission {
			utils.Forbidden(c, err.Error())
			return
		}
		utils.NotFound(c, "Activity not found")
		return
	}

	utils.Success(c, gin.H{
		"activity": formatActivity(activity),
	})
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	userID := utils.GetUserID(c)

	babyRepo := babies.NewRepository(h.svc.repo.Pool())
	if err := h.svc.Delete(c.Request.Context(), id, userID, babyRepo); err != nil {
		if err == ErrNoPermission {
			utils.Forbidden(c, err.Error())
			return
		}
		utils.NotFound(c, "Activity not found")
		return
	}

	utils.Success(c, gin.H{"message": "Activity deleted successfully"})
}

func formatActivity(a *Activity) gin.H {
	result := gin.H{
		"id":               a.ID,
		"baby_id":          a.BabyID,
		"user_id":          a.UserID,
		"type":             a.Type,
		"started_at":       a.StartedAt.Format(time.RFC3339),
		"duration_minutes": a.DurationMinutes,
		"metadata":         a.Metadata,
		"notes":            a.Notes,
		"created_at":       a.CreatedAt.Format(time.RFC3339),
		"updated_at":       a.UpdatedAt.Format(time.RFC3339),
	}

	if a.EndedAt != nil {
		result["ended_at"] = a.EndedAt.Format(time.RFC3339)
	}
	if a.UserName != nil {
		result["user"] = gin.H{"full_name": *a.UserName}
	}

	return result
}

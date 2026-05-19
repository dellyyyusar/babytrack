package babies

import (
	"github.com/gin-gonic/gin"

	"github.com/beetrack/backend/internal/utils"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Create(c *gin.Context) {
	var req CreateBabyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	userID := utils.GetUserID(c)
	baby, err := h.svc.Create(c.Request.Context(), userID, req)
	if err != nil {
		utils.InternalError(c, "Failed to create baby")
		return
	}

	utils.Created(c, gin.H{
		"baby": gin.H{
			"id":           baby.ID,
			"name":         baby.Name,
			"birth_date":   baby.BirthDate.Format("2006-01-02"),
			"gender":       baby.Gender,
			"photo_url":    baby.PhotoURL,
			"birth_weight": baby.BirthWeight,
			"birth_length": baby.BirthLength,
			"blood_type":   baby.BloodType,
			"notes":        baby.Notes,
			"created_at":   baby.CreatedAt,
		},
	})
}

func (h *Handler) List(c *gin.Context) {
	userID := utils.GetUserID(c)
	babies, err := h.svc.List(c.Request.Context(), userID)
	if err != nil {
		utils.InternalError(c, "Failed to fetch babies")
		return
	}

	var result []gin.H
	for _, baby := range babies {
		result = append(result, gin.H{
			"id":           baby.ID,
			"name":         baby.Name,
			"birth_date":   baby.BirthDate.Format("2006-01-02"),
			"gender":       baby.Gender,
			"photo_url":    baby.PhotoURL,
			"birth_weight": baby.BirthWeight,
			"birth_length": baby.BirthLength,
			"blood_type":   baby.BloodType,
			"notes":        baby.Notes,
			"created_at":   baby.CreatedAt,
		})
	}

	utils.Success(c, gin.H{"babies": result})
}

func (h *Handler) Get(c *gin.Context) {
	babyID := c.Param("id")
	userID := utils.GetUserID(c)

	baby, err := h.svc.Get(c.Request.Context(), babyID, userID)
	if err != nil {
		if err == ErrNoAccess {
			utils.Forbidden(c, err.Error())
			return
		}
		utils.NotFound(c, "Baby not found")
		return
	}

	utils.Success(c, gin.H{
		"baby": gin.H{
			"id":           baby.ID,
			"name":         baby.Name,
			"birth_date":   baby.BirthDate.Format("2006-01-02"),
			"gender":       baby.Gender,
			"photo_url":    baby.PhotoURL,
			"birth_weight": baby.BirthWeight,
			"birth_length": baby.BirthLength,
			"blood_type":   baby.BloodType,
			"notes":        baby.Notes,
			"created_at":   baby.CreatedAt,
		},
	})
}

func (h *Handler) Update(c *gin.Context) {
	var req UpdateBabyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	babyID := c.Param("id")
	userID := utils.GetUserID(c)

	baby, err := h.svc.Update(c.Request.Context(), babyID, userID, req)
	if err != nil {
		if err == ErrNoPermission || err == ErrNoAccess {
			utils.Forbidden(c, err.Error())
			return
		}
		utils.NotFound(c, "Baby not found")
		return
	}

	utils.Success(c, gin.H{
		"baby": gin.H{
			"id":           baby.ID,
			"name":         baby.Name,
			"birth_date":   baby.BirthDate.Format("2006-01-02"),
			"gender":       baby.Gender,
			"photo_url":    baby.PhotoURL,
			"birth_weight": baby.BirthWeight,
			"birth_length": baby.BirthLength,
			"blood_type":   baby.BloodType,
			"notes":        baby.Notes,
		},
	})
}

func (h *Handler) Delete(c *gin.Context) {
	babyID := c.Param("id")
	userID := utils.GetUserID(c)

	if err := h.svc.Delete(c.Request.Context(), babyID, userID); err != nil {
		if err == ErrNoPermission || err == ErrNoAccess {
			utils.Forbidden(c, err.Error())
			return
		}
		utils.NotFound(c, "Baby not found")
		return
	}

	utils.Success(c, gin.H{"message": "Baby deleted successfully"})
}

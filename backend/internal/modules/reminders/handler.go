package reminders

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
	var req CreateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	babyID := c.Param("id")
	userID := utils.GetUserID(c)

	reminder, err := h.svc.Create(c.Request.Context(), babyID, userID, req)
	if err != nil {
		utils.InternalError(c, "Failed to create reminder")
		return
	}

	utils.Created(c, gin.H{"reminder": reminder})
}

func (h *Handler) List(c *gin.Context) {
	babyID := c.Param("id")

	reminders, err := h.svc.List(c.Request.Context(), babyID)
	if err != nil {
		utils.InternalError(c, "Failed to fetch reminders")
		return
	}

	utils.Success(c, gin.H{"reminders": reminders})
}

func (h *Handler) Update(c *gin.Context) {
	var req UpdateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	id := c.Param("id")
	userID := utils.GetUserID(c)

	reminder, err := h.svc.Update(c.Request.Context(), id, userID, req)
	if err != nil {
		if err == ErrNoAccess {
			utils.Forbidden(c, err.Error())
			return
		}
		utils.NotFound(c, "Reminder not found")
		return
	}

	utils.Success(c, gin.H{"reminder": reminder})
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")
	userID := utils.GetUserID(c)

	if err := h.svc.Delete(c.Request.Context(), id, userID); err != nil {
		if err == ErrNoAccess {
			utils.Forbidden(c, err.Error())
			return
		}
		utils.NotFound(c, "Reminder not found")
		return
	}

	utils.Success(c, gin.H{"message": "Reminder deleted successfully"})
}

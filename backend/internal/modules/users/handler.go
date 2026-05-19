package users

import (
	"github.com/gin-gonic/gin"

	"github.com/beetrack/backend/internal/utils"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) GetMe(c *gin.Context) {
	userID := utils.GetUserID(c)
	if userID == "" {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	user, err := h.repo.GetByID(c.Request.Context(), userID)
	if err != nil {
		utils.NotFound(c, "User not found")
		return
	}

	utils.Success(c, gin.H{
		"user": gin.H{
			"id":         user.ID,
			"full_name":  user.FullName,
			"email":      user.Email,
			"avatar_url": user.AvatarURL,
		},
	})
}

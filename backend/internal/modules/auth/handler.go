package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/beetrack/backend/internal/utils"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	resp, err := h.svc.Register(c.Request.Context(), req)
	if err != nil {
		if err == ErrEmailExists {
			utils.BadRequest(c, err.Error())
			return
		}
		utils.InternalError(c, "Registration failed")
		return
	}

	utils.Created(c, resp)
}

func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	resp, err := h.svc.Login(c.Request.Context(), req)
	if err != nil {
		if err == ErrInvalidCreds {
			utils.Unauthorized(c, err.Error())
			return
		}
		utils.InternalError(c, "Login failed")
		return
	}

	utils.Success(c, resp)
}

func (h *Handler) Refresh(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	resp, err := h.svc.Refresh(c.Request.Context(), req)
	if err != nil {
		utils.Unauthorized(c, err.Error())
		return
	}

	utils.Success(c, resp)
}

func (h *Handler) Logout(c *gin.Context) {
	userID := utils.GetUserID(c)
	if userID == "" {
		utils.Unauthorized(c, "User not authenticated")
		return
	}

	if err := h.svc.Logout(c.Request.Context(), userID); err != nil {
		utils.InternalError(c, "Logout failed")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

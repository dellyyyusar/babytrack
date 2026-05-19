package immunizations

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
	var req CreateImmunizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	babyID := c.Param("id")

	immunization, err := h.svc.Create(c.Request.Context(), babyID, req)
	if err != nil {
		utils.InternalError(c, "Failed to create immunization")
		return
	}

	utils.Created(c, gin.H{"immunization": immunization})
}

func (h *Handler) List(c *gin.Context) {
	babyID := c.Param("id")

	immunizations, err := h.svc.List(c.Request.Context(), babyID)
	if err != nil {
		utils.InternalError(c, "Failed to fetch immunizations")
		return
	}

	utils.Success(c, gin.H{"immunizations": immunizations})
}

func (h *Handler) Update(c *gin.Context) {
	var req UpdateImmunizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request: "+err.Error())
		return
	}

	id := c.Param("id")

	immunization, err := h.svc.Update(c.Request.Context(), id, req)
	if err != nil {
		utils.NotFound(c, "Immunization not found")
		return
	}

	utils.Success(c, gin.H{"immunization": immunization})
}

func (h *Handler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		utils.NotFound(c, "Immunization not found")
		return
	}

	utils.Success(c, gin.H{"message": "Immunization deleted successfully"})
}

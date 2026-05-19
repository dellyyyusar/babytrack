package utils

import (
	"github.com/gin-gonic/gin"
)

const (
	UserIDKey   = "user_id"
	UserEmailKey = "user_email"
)

func GetUserID(c *gin.Context) string {
	if id, exists := c.Get(UserIDKey); exists {
		return id.(string)
	}
	return ""
}

func GetUserEmail(c *gin.Context) string {
	if email, exists := c.Get(UserEmailKey); exists {
		return email.(string)
	}
	return ""
}

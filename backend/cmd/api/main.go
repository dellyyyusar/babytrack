package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/rs/cors"

	"github.com/beetrack/backend/internal/config"
	"github.com/beetrack/backend/internal/database"
	"github.com/beetrack/backend/internal/middleware"
	"github.com/beetrack/backend/internal/modules/activities"
	"github.com/beetrack/backend/internal/modules/auth"
	"github.com/beetrack/backend/internal/modules/babies"
	"github.com/beetrack/backend/internal/modules/dashboard"
	"github.com/beetrack/backend/internal/modules/immunizations"
	"github.com/beetrack/backend/internal/modules/reminders"
	"github.com/beetrack/backend/internal/modules/users"
)

func main() {
	godotenv.Load()

	cfg := config.Load()
	db := database.Connect(cfg.DatabaseURL)
	defer db.Close()

	// database.RunMigrations(cfg.DatabaseURL, "migrations")

	r := gin.Default()
	r.Use(middleware.SecurityHeaders())

	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})
	r.Use(func(c *gin.Context) {
		corsHandler.HandlerFunc(c.Writer, c.Request)
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	authMiddleware := middleware.AuthMiddleware(cfg.JWTSecret)

	authRepo := auth.NewRepository(db)
	authSvc := auth.NewService(authRepo, cfg.JWTSecret)
	authHandler := auth.NewHandler(authSvc)

	userRepo := users.NewRepository(db)
	userHandler := users.NewHandler(userRepo)

	babyRepo := babies.NewRepository(db)
	babySvc := babies.NewService(babyRepo)
	babyHandler := babies.NewHandler(babySvc)

	activityRepo := activities.NewRepository(db)
	activitySvc := activities.NewService(activityRepo)
	activityHandler := activities.NewHandler(activitySvc)

	dashboardSvc := dashboard.NewService(activityRepo)
	dashboardHandler := dashboard.NewHandler(dashboardSvc)

	reminderRepo := reminders.NewRepository(db)
	reminderSvc := reminders.NewService(reminderRepo)
	reminderHandler := reminders.NewHandler(reminderSvc)

	immunizationRepo := immunizations.NewRepository(db)
	immunizationSvc := immunizations.NewService(immunizationRepo)
	immunizationHandler := immunizations.NewHandler(immunizationSvc)

	api := r.Group("/api")
	{
		authLimiter := middleware.NewRateLimiter(10, 20, 1*time.Minute)

		auth := api.Group("/auth")
		auth.Use(middleware.RateLimit(authLimiter))
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/logout", authMiddleware, authHandler.Logout)
		}

		auth.GET("/me", authMiddleware, userHandler.GetMe)

		babies := api.Group("/babies")
		babies.Use(authMiddleware)
		{
			babies.GET("/", babyHandler.List)
			babies.POST("/", babyHandler.Create)
			babies.GET("/:id", babyHandler.Get)
			babies.PATCH("/:id", babyHandler.Update)
			babies.DELETE("/:id", babyHandler.Delete)
		}

		babyActivities := api.Group("/babies/:id/activities")
		babyActivities.Use(authMiddleware)
		{
			babyActivities.GET("/", activityHandler.List)
			babyActivities.POST("/", activityHandler.Create)
		}

		activities := api.Group("/activities")
		activities.Use(authMiddleware)
		{
			activities.GET("/:id", activityHandler.Get)
			activities.PATCH("/:id", activityHandler.Update)
			activities.DELETE("/:id", activityHandler.Delete)
		}

		dashboards := api.Group("/babies/:id/dashboard-summary")
		dashboards.Use(authMiddleware)
		{
			dashboards.GET("/", dashboardHandler.Summary)
		}

		babyReminders := api.Group("/babies/:id/reminders")
		babyReminders.Use(authMiddleware)
		{
			babyReminders.GET("/", reminderHandler.List)
			babyReminders.POST("/", reminderHandler.Create)
		}

		reminders := api.Group("/reminders")
		reminders.Use(authMiddleware)
		{
			reminders.PATCH("/:id", reminderHandler.Update)
			reminders.DELETE("/:id", reminderHandler.Delete)
		}

		babyImmunizations := api.Group("/babies/:id/immunizations")
		babyImmunizations.Use(authMiddleware)
		{
			babyImmunizations.GET("/", immunizationHandler.List)
			babyImmunizations.POST("/", immunizationHandler.Create)
		}

		immunizations := api.Group("/immunizations")
		immunizations.Use(authMiddleware)
		{
			immunizations.PATCH("/:id", immunizationHandler.Update)
			immunizations.DELETE("/:id", immunizationHandler.Delete)
		}
	}

	port := cfg.AppPort
	if port == "" {
		port = "8080"
	}
	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}

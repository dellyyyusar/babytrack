package config

import (
	"log"
	"os"
)

type Config struct {
	DatabaseURL string
	JWTSecret   string
	AppPort     string
	AppEnv      string
}

func Load() *Config {
	jwtSecret := getEnv("JWT_SECRET", "dev-secret-key-change-in-production")
	if jwtSecret == "dev-secret-key-change-in-production" {
		log.Println("WARNING: Using default JWT secret. Set JWT_SECRET environment variable for production.")
	}

	dbURL := getEnv("DATABASE_URL", "")
	if dbURL == "" {
		log.Println("WARNING: DATABASE_URL not set. Using default for development.")
		dbURL = "postgresql://utZTezUrJDsyRGN49:bc2523c6a76456ad33b553cb@pgsql-dbas-jkt-001.sumobase.my.id:65432/db5dcada27db8533fc"
	}

	return &Config{
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
		AppPort:     getEnv("APP_PORT", "8080"),
		AppEnv:      getEnv("APP_ENV", "development"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

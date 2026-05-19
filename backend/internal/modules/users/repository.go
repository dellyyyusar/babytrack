package users

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

type User struct {
	ID        string    `json:"id"`
	FullName  string    `json:"full_name"`
	Email     string    `json:"email"`
	AvatarURL *string   `json:"avatar_url"`
	CreatedAt time.Time `json:"created_at"`
}

func (r *Repository) GetByID(ctx context.Context, id string) (*User, error) {
	var user User
	err := r.pool.QueryRow(ctx,
		`SELECT id, full_name, email, avatar_url, created_at FROM users WHERE id = $1`,
		id,
	).Scan(&user.ID, &user.FullName, &user.Email, &user.AvatarURL, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

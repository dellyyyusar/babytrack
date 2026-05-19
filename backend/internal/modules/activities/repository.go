package activities

import (
	"context"
	"encoding/json"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Pool() *pgxpool.Pool {
	return r.pool
}

type Activity struct {
	ID              string          `json:"id"`
	BabyID          string          `json:"baby_id"`
	UserID          string          `json:"user_id"`
	Type            string          `json:"type"`
	StartedAt       time.Time       `json:"started_at"`
	EndedAt         *time.Time      `json:"ended_at"`
	DurationMinutes *int            `json:"duration_minutes"`
	Metadata        json.RawMessage `json:"metadata"`
	Notes           *string         `json:"notes"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	UserName        *string         `json:"user_name,omitempty"`
}

func (r *Repository) Create(ctx context.Context, babyID, userID, activityType, startedAt string, endedAt *string, durationMinutes *int, metadata json.RawMessage, notes *string) (*Activity, error) {
	var a Activity
	err := r.pool.QueryRow(ctx,
		`INSERT INTO activities (baby_id, user_id, type, started_at, ended_at, duration_minutes, metadata, notes)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, baby_id, user_id, type, started_at, ended_at, duration_minutes, metadata, notes, created_at, updated_at`,
		babyID, userID, activityType, startedAt, endedAt, durationMinutes, metadata, notes,
	).Scan(&a.ID, &a.BabyID, &a.UserID, &a.Type, &a.StartedAt, &a.EndedAt, &a.DurationMinutes, &a.Metadata, &a.Notes, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Activity, error) {
	var a Activity
	err := r.pool.QueryRow(ctx,
		`SELECT id, baby_id, user_id, type, started_at, ended_at, duration_minutes, metadata, notes, created_at, updated_at
		 FROM activities WHERE id = $1`,
		id,
	).Scan(&a.ID, &a.BabyID, &a.UserID, &a.Type, &a.StartedAt, &a.EndedAt, &a.DurationMinutes, &a.Metadata, &a.Notes, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) ListByBaby(ctx context.Context, babyID string, activityType, date string, page, limit int) ([]Activity, int, error) {
	where := "WHERE baby_id = $1"
	args := []interface{}{babyID}
	argIdx := 2

	if activityType != "" {
		where += " AND type = $2"
		args = append(args, activityType)
		argIdx = 3
	}

	if date != "" {
		where += " AND started_at::date = $" + itoa(argIdx)
		args = append(args, date)
		argIdx++
	}

	if limit <= 0 {
		limit = 20
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	var total int
	countQuery := "SELECT COUNT(*) FROM activities " + where
	r.pool.QueryRow(ctx, countQuery, args...).Scan(&total)

	query := `SELECT a.id, a.baby_id, a.user_id, a.type, a.started_at, a.ended_at, a.duration_minutes, a.metadata, a.notes, a.created_at, a.updated_at, u.full_name as user_name
	           FROM activities a
	           JOIN users u ON a.user_id = u.id ` + where + ` ORDER BY a.started_at DESC LIMIT $` + itoa(argIdx) + ` OFFSET $` + itoa(argIdx+1)

	args = append(args, limit, offset)
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	activities := make([]Activity, 0)
	for rows.Next() {
		var a Activity
		if err := rows.Scan(&a.ID, &a.BabyID, &a.UserID, &a.Type, &a.StartedAt, &a.EndedAt, &a.DurationMinutes, &a.Metadata, &a.Notes, &a.CreatedAt, &a.UpdatedAt, &a.UserName); err != nil {
			return nil, 0, err
		}
		activities = append(activities, a)
	}
	return activities, total, nil
}

func (r *Repository) Update(ctx context.Context, id, activityType, startedAt string, endedAt *string, durationMinutes *int, metadata json.RawMessage, notes *string) (*Activity, error) {
	var a Activity
	err := r.pool.QueryRow(ctx,
		`UPDATE activities SET type = $1, started_at = $2, ended_at = $3, duration_minutes = $4, metadata = $5, notes = $6, updated_at = NOW()
		 WHERE id = $7
		 RETURNING id, baby_id, user_id, type, started_at, ended_at, duration_minutes, metadata, notes, created_at, updated_at`,
		activityType, startedAt, endedAt, durationMinutes, metadata, notes, id,
	).Scan(&a.ID, &a.BabyID, &a.UserID, &a.Type, &a.StartedAt, &a.EndedAt, &a.DurationMinutes, &a.Metadata, &a.Notes, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM activities WHERE id = $1`, id)
	return err
}

func (r *Repository) GetTodayFeedingCount(ctx context.Context, babyID string) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM activities WHERE baby_id = $1 AND type = 'feeding' AND started_at::date = CURRENT_DATE`,
		babyID,
	).Scan(&count)
	return count, err
}

func (r *Repository) GetTodayFeedingMinutes(ctx context.Context, babyID string) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_minutes), 0) FROM activities WHERE baby_id = $1 AND type = 'feeding' AND started_at::date = CURRENT_DATE`,
		babyID,
	).Scan(&total)
	return total, err
}

func (r *Repository) GetTodaySleepMinutes(ctx context.Context, babyID string) (int, error) {
	var total int
	err := r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(duration_minutes), 0) FROM activities WHERE baby_id = $1 AND type = 'sleep' AND started_at::date = CURRENT_DATE`,
		babyID,
	).Scan(&total)
	return total, err
}

func (r *Repository) GetTodayDiaperCount(ctx context.Context, babyID string) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM activities WHERE baby_id = $1 AND type = 'diaper' AND started_at::date = CURRENT_DATE`,
		babyID,
	).Scan(&count)
	return count, err
}

func (r *Repository) GetLastActivityByType(ctx context.Context, babyID, activityType string) (*Activity, error) {
	var a Activity
	err := r.pool.QueryRow(ctx,
		`SELECT id, baby_id, user_id, type, started_at, ended_at, duration_minutes, metadata, notes, created_at, updated_at
		 FROM activities WHERE baby_id = $1 AND type = $2
		 ORDER BY started_at DESC LIMIT 1`,
		babyID, activityType,
	).Scan(&a.ID, &a.BabyID, &a.UserID, &a.Type, &a.StartedAt, &a.EndedAt, &a.DurationMinutes, &a.Metadata, &a.Notes, &a.CreatedAt, &a.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func itoa(n int) string {
	return strconv.Itoa(n)
}

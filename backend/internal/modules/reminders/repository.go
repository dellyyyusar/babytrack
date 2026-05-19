package reminders

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

type Reminder struct {
	ID         string    `json:"id"`
	BabyID     string    `json:"baby_id"`
	UserID     string    `json:"user_id"`
	Title      string    `json:"title"`
	Type       string    `json:"type"`
	RemindAt   time.Time `json:"remind_at"`
	RepeatRule string    `json:"repeat_rule"`
	IsDone     bool      `json:"is_done"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
}

func (r *Repository) Create(ctx context.Context, babyID, userID, title, reminderType, remindAt, repeatRule string) (*Reminder, error) {
	var rem Reminder
	err := r.pool.QueryRow(ctx,
		`INSERT INTO reminders (baby_id, user_id, title, type, remind_at, repeat_rule)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, baby_id, user_id, title, type, remind_at, repeat_rule, is_done, is_active, created_at`,
		babyID, userID, title, reminderType, remindAt, repeatRule,
	).Scan(&rem.ID, &rem.BabyID, &rem.UserID, &rem.Title, &rem.Type, &rem.RemindAt, &rem.RepeatRule, &rem.IsDone, &rem.IsActive, &rem.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &rem, nil
}

func (r *Repository) ListByBaby(ctx context.Context, babyID string) ([]Reminder, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, baby_id, user_id, title, type, remind_at, repeat_rule, is_done, is_active, created_at
		 FROM reminders WHERE baby_id = $1 ORDER BY remind_at ASC`,
		babyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reminders []Reminder
	for rows.Next() {
		var rem Reminder
		if err := rows.Scan(&rem.ID, &rem.BabyID, &rem.UserID, &rem.Title, &rem.Type, &rem.RemindAt, &rem.RepeatRule, &rem.IsDone, &rem.IsActive, &rem.CreatedAt); err != nil {
			return nil, err
		}
		reminders = append(reminders, rem)
	}
	return reminders, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Reminder, error) {
	var rem Reminder
	err := r.pool.QueryRow(ctx,
		`SELECT id, baby_id, user_id, title, type, remind_at, repeat_rule, is_done, is_active, created_at
		 FROM reminders WHERE id = $1`,
		id,
	).Scan(&rem.ID, &rem.BabyID, &rem.UserID, &rem.Title, &rem.Type, &rem.RemindAt, &rem.RepeatRule, &rem.IsDone, &rem.IsActive, &rem.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &rem, nil
}

func (r *Repository) Update(ctx context.Context, id, title, reminderType, remindAt, repeatRule string, isDone, isActive bool) (*Reminder, error) {
	var rem Reminder
	err := r.pool.QueryRow(ctx,
		`UPDATE reminders SET title = $1, type = $2, remind_at = $3, repeat_rule = $4, is_done = $5, is_active = $6
		 WHERE id = $7
		 RETURNING id, baby_id, user_id, title, type, remind_at, repeat_rule, is_done, is_active, created_at`,
		title, reminderType, remindAt, repeatRule, isDone, isActive, id,
	).Scan(&rem.ID, &rem.BabyID, &rem.UserID, &rem.Title, &rem.Type, &rem.RemindAt, &rem.RepeatRule, &rem.IsDone, &rem.IsActive, &rem.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &rem, nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM reminders WHERE id = $1`, id)
	return err
}

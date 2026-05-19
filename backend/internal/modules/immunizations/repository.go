package immunizations

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

type Immunization struct {
	ID            string     `json:"id"`
	BabyID        string     `json:"baby_id"`
	VaccineName   string     `json:"vaccine_name"`
	ScheduledDate time.Time  `json:"scheduled_date"`
	CompletedDate *time.Time `json:"completed_date"`
	Status        string     `json:"status"`
	Location      *string    `json:"location"`
	Notes         *string    `json:"notes"`
	CreatedAt     time.Time  `json:"created_at"`
}

func (r *Repository) Create(ctx context.Context, babyID, vaccineName, scheduledDate string, location, notes *string) (*Immunization, error) {
	var imm Immunization
	err := r.pool.QueryRow(ctx,
		`INSERT INTO immunizations (baby_id, vaccine_name, scheduled_date, location, notes)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, baby_id, vaccine_name, scheduled_date, completed_date, status, location, notes, created_at`,
		babyID, vaccineName, scheduledDate, location, notes,
	).Scan(&imm.ID, &imm.BabyID, &imm.VaccineName, &imm.ScheduledDate, &imm.CompletedDate, &imm.Status, &imm.Location, &imm.Notes, &imm.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &imm, nil
}

func (r *Repository) ListByBaby(ctx context.Context, babyID string) ([]Immunization, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT id, baby_id, vaccine_name, scheduled_date, completed_date, status, location, notes, created_at
		 FROM immunizations WHERE baby_id = $1 ORDER BY scheduled_date DESC`,
		babyID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var immunizations []Immunization
	for rows.Next() {
		var imm Immunization
		if err := rows.Scan(&imm.ID, &imm.BabyID, &imm.VaccineName, &imm.ScheduledDate, &imm.CompletedDate, &imm.Status, &imm.Location, &imm.Notes, &imm.CreatedAt); err != nil {
			return nil, err
		}
		immunizations = append(immunizations, imm)
	}
	return immunizations, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Immunization, error) {
	var imm Immunization
	err := r.pool.QueryRow(ctx,
		`SELECT id, baby_id, vaccine_name, scheduled_date, completed_date, status, location, notes, created_at
		 FROM immunizations WHERE id = $1`,
		id,
	).Scan(&imm.ID, &imm.BabyID, &imm.VaccineName, &imm.ScheduledDate, &imm.CompletedDate, &imm.Status, &imm.Location, &imm.Notes, &imm.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &imm, nil
}

func (r *Repository) Update(ctx context.Context, id, vaccineName, scheduledDate string, completedDate *time.Time, status string, location, notes *string) (*Immunization, error) {
	var imm Immunization
	err := r.pool.QueryRow(ctx,
		`UPDATE immunizations SET vaccine_name = $1, scheduled_date = $2, completed_date = $3, status = $4, location = $5, notes = $6
		 WHERE id = $7
		 RETURNING id, baby_id, vaccine_name, scheduled_date, completed_date, status, location, notes, created_at`,
		vaccineName, scheduledDate, completedDate, status, location, notes, id,
	).Scan(&imm.ID, &imm.BabyID, &imm.VaccineName, &imm.ScheduledDate, &imm.CompletedDate, &imm.Status, &imm.Location, &imm.Notes, &imm.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &imm, nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM immunizations WHERE id = $1`, id)
	return err
}

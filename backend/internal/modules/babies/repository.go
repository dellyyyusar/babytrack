package babies

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

type Baby struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	BirthDate   time.Time  `json:"birth_date"`
	Gender      string     `json:"gender"`
	PhotoURL    *string    `json:"photo_url"`
	BirthWeight *float64   `json:"birth_weight"`
	BirthLength *float64   `json:"birth_length"`
	BloodType   *string    `json:"blood_type"`
	Notes       *string    `json:"notes"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type BabyMember struct {
	ID        string    `json:"id"`
	BabyID    string    `json:"baby_id"`
	UserID    string    `json:"user_id"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func (r *Repository) Create(ctx context.Context, name, birthDate, gender string, birthWeight, birthLength *float64, bloodType, notes *string) (*Baby, error) {
	var baby Baby
	err := r.pool.QueryRow(ctx,
		`INSERT INTO babies (name, birth_date, gender, birth_weight, birth_length, blood_type, notes)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)
		 RETURNING id, name, birth_date, gender, photo_url, birth_weight, birth_length, blood_type, notes, created_at, updated_at`,
		name, birthDate, gender, birthWeight, birthLength, bloodType, notes,
	).Scan(&baby.ID, &baby.Name, &baby.BirthDate, &baby.Gender, &baby.PhotoURL, &baby.BirthWeight, &baby.BirthLength, &baby.BloodType, &baby.Notes, &baby.CreatedAt, &baby.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &baby, nil
}

func (r *Repository) AddMember(ctx context.Context, babyID, userID, role string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO baby_members (baby_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (baby_id, user_id) DO UPDATE SET role = $3`,
		babyID, userID, role,
	)
	return err
}

func (r *Repository) GetMemberRole(ctx context.Context, babyID, userID string) (string, error) {
	var role string
	err := r.pool.QueryRow(ctx,
		`SELECT role FROM baby_members WHERE baby_id = $1 AND user_id = $2`,
		babyID, userID,
	).Scan(&role)
	if err != nil {
		return "", err
	}
	return role, nil
}

func (r *Repository) ListByUser(ctx context.Context, userID string) ([]Baby, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT b.id, b.name, b.birth_date, b.gender, b.photo_url, b.birth_weight, b.birth_length, b.blood_type, b.notes, b.created_at, b.updated_at
		 FROM babies b
		 JOIN baby_members bm ON b.id = bm.baby_id
		 WHERE bm.user_id = $1
		 ORDER BY b.created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var babies []Baby
	for rows.Next() {
		var baby Baby
		if err := rows.Scan(&baby.ID, &baby.Name, &baby.BirthDate, &baby.Gender, &baby.PhotoURL, &baby.BirthWeight, &baby.BirthLength, &baby.BloodType, &baby.Notes, &baby.CreatedAt, &baby.UpdatedAt); err != nil {
			return nil, err
		}
		babies = append(babies, baby)
	}
	return babies, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Baby, error) {
	var baby Baby
	err := r.pool.QueryRow(ctx,
		`SELECT id, name, birth_date, gender, photo_url, birth_weight, birth_length, blood_type, notes, created_at, updated_at
		 FROM babies WHERE id = $1`,
		id,
	).Scan(&baby.ID, &baby.Name, &baby.BirthDate, &baby.Gender, &baby.PhotoURL, &baby.BirthWeight, &baby.BirthLength, &baby.BloodType, &baby.Notes, &baby.CreatedAt, &baby.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &baby, nil
}

func (r *Repository) Update(ctx context.Context, id, name, birthDate, gender string, birthWeight, birthLength *float64, bloodType, notes *string) (*Baby, error) {
	var baby Baby
	err := r.pool.QueryRow(ctx,
		`UPDATE babies SET name = $1, birth_date = $2, gender = $3, birth_weight = $4, birth_length = $5, blood_type = $6, notes = $7, updated_at = NOW()
		 WHERE id = $8
		 RETURNING id, name, birth_date, gender, photo_url, birth_weight, birth_length, blood_type, notes, created_at, updated_at`,
		name, birthDate, gender, birthWeight, birthLength, bloodType, notes, id,
	).Scan(&baby.ID, &baby.Name, &baby.BirthDate, &baby.Gender, &baby.PhotoURL, &baby.BirthWeight, &baby.BirthLength, &baby.BloodType, &baby.Notes, &baby.CreatedAt, &baby.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &baby, nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM babies WHERE id = $1`, id)
	return err
}

func (r *Repository) DeleteMembers(ctx context.Context, babyID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM baby_members WHERE baby_id = $1`, babyID)
	return err
}

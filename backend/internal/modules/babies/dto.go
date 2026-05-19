package babies

type CreateBabyRequest struct {
	Name        string   `json:"name" binding:"required,max=100"`
	BirthDate   string   `json:"birth_date" binding:"required"`
	Gender      string   `json:"gender" binding:"required,oneof=male female"`
	PhotoURL    *string  `json:"photo_url" binding:"omitempty,max=500"`
	BirthWeight *float64 `json:"birth_weight"`
	BirthLength *float64 `json:"birth_length"`
	BloodType   *string  `json:"blood_type" binding:"omitempty,max=5"`
	Notes       *string  `json:"notes" binding:"omitempty,max=2000"`
}

type UpdateBabyRequest struct {
	Name        *string  `json:"name" binding:"omitempty,max=100"`
	BirthDate   *string  `json:"birth_date"`
	Gender      *string  `json:"gender" binding:"omitempty,oneof=male female"`
	PhotoURL    *string  `json:"photo_url" binding:"omitempty,max=500"`
	BirthWeight *float64 `json:"birth_weight"`
	BirthLength *float64 `json:"birth_length"`
	BloodType   *string  `json:"blood_type" binding:"omitempty,max=5"`
	Notes       *string  `json:"notes" binding:"omitempty,max=2000"`
}

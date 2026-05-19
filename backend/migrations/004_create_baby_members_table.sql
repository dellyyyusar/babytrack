CREATE TABLE baby_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baby_id UUID NOT NULL REFERENCES babies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'parent', 'caregiver', 'viewer')),
    invited_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(baby_id, user_id)
);

CREATE INDEX idx_baby_members_baby_id ON baby_members(baby_id);
CREATE INDEX idx_baby_members_user_id ON baby_members(user_id);

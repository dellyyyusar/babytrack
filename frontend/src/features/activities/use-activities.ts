import { api } from '@/lib/api'

interface ActivityBase {
  type: 'feeding' | 'sleep' | 'diaper' | 'growth' | 'medicine' | 'temperature' | 'note'
  started_at: string
  ended_at?: string
  duration_minutes?: number
  metadata?: Record<string, unknown>
  notes?: string
}

export interface Activity extends ActivityBase {
  id: string
  baby_id: string
  user_id: string
  created_at: string
  updated_at: string
  user?: { full_name: string }
}

interface ActivitiesResponse {
  activities: Activity[]
  total: number
}

interface DashboardSummary {
  last_feeding: Activity | null
  last_sleep: Activity | null
  last_diaper: Activity | null
  today_feeding_count: number
  today_sleep_minutes: number
  today_diaper_count: number
  today_feeding_minutes: number
  upcoming_immunizations: unknown[]
}

export async function getActivities(
  babyId: string,
  params?: { type?: string; date?: string; page?: string; limit?: string }
): Promise<ActivitiesResponse> {
  return api<ActivitiesResponse>(`/babies/${babyId}/activities`, {
    params: params as Record<string, string>,
  })
}

export async function getDashboardSummary(babyId: string): Promise<DashboardSummary> {
  return api<DashboardSummary>(`/babies/${babyId}/dashboard-summary`)
}

export async function createActivity(
  babyId: string,
  data: ActivityBase
): Promise<{ activity: Activity }> {
  return api<{ activity: Activity }>(`/babies/${babyId}/activities`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityBase>
): Promise<{ activity: Activity }> {
  return api<{ activity: Activity }>(`/activities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteActivity(id: string): Promise<void> {
  await api(`/activities/${id}`, { method: 'DELETE' })
}

import { api } from '@/lib/api'
import { useBabyStore } from '@/stores/baby-store'

interface Baby {
  id: string
  name: string
  birth_date: string
  gender: string
  photo_url: string | null
  birth_weight: number | null
  birth_length: number | null
  blood_type: string | null
  notes: string | null
}

export async function createBaby(data: {
  name: string
  birth_date: string
  gender: string
  birth_weight?: number
  birth_length?: number
  blood_type?: string
  notes?: string
}): Promise<Baby> {
  const result = await api<{ baby: Baby }>('/babies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  await useBabyStore.getState().fetchBabies()
  return result.baby
}

export async function updateBaby(id: string, data: Partial<Baby>): Promise<Baby> {
  const result = await api<{ baby: Baby }>(`/babies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  await useBabyStore.getState().fetchBabies()
  return result.baby
}

export async function deleteBaby(id: string): Promise<void> {
  await api(`/babies/${id}`, { method: 'DELETE' })
  await useBabyStore.getState().fetchBabies()
}

export { useBabyStore }

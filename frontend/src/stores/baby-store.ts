import { create } from 'zustand'
import { api } from '@/lib/api'

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

interface BabyState {
  babies: Baby[]
  selectedBabyId: string | null
  isLoading: boolean
  fetchBabies: () => Promise<void>
  selectBaby: (id: string) => void
  getSelectedBaby: () => Baby | null
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies: [],
  selectedBabyId: null,
  isLoading: false,
  fetchBabies: async () => {
    set({ isLoading: true })
    try {
      const data = await api<{ babies: Baby[] }>('/babies')
      const babies = data.babies
      set((state) => ({
        babies,
        isLoading: false,
        selectedBabyId: state.selectedBabyId || babies[0]?.id || null,
      }))
    } catch {
      set({ isLoading: false })
    }
  },
  selectBaby: (id) => set({ selectedBabyId: id }),
  getSelectedBaby: () => {
    const state = get()
    return state.babies.find((b) => b.id === state.selectedBabyId) || null
  },
}))

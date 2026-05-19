import { useBabyStore } from '@/stores/baby-store'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function BabySwitcher() {
  const { babies, selectedBabyId, selectBaby } = useBabyStore()

  if (babies.length <= 1) return null

  return (
    <Select value={selectedBabyId || undefined} onValueChange={selectBaby}>
      <SelectTrigger className="w-[160px] h-9 text-sm">
        <SelectValue placeholder="Pilih bayi" />
      </SelectTrigger>
      <SelectContent>
        {babies.map((baby) => (
          <SelectItem key={baby.id} value={baby.id}>
            {baby.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

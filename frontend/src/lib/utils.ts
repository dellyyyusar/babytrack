import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TZ = 'Asia/Jakarta'

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('id-ID', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('id-ID', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)} ${formatTime(date)}`
}

export function getLocalDatetimeString(date?: Date): string {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function getAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + now.getMonth() - birth.getMonth()
  const days = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)) % 30

  if (months < 1) return `${days} hari`
  if (months < 24) return `${months} bulan ${days} hari`
  const years = Math.floor(months / 12)
  return `${years} tahun ${months % 12} bulan`
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    feeding: 'Baby',
    sleep: 'Moon',
    diaper: 'Droplets',
    growth: 'Scale',
    medicine: 'Pill',
    temperature: 'Thermometer',
    note: 'FileText',
  }
  return icons[type] || 'FileText'
}

export function getActivityLabel(type: string): string {
  const labels: Record<string, string> = {
    feeding: 'Menyusu',
    sleep: 'Tidur',
    diaper: 'Popok',
    growth: 'Tumbuh Kembang',
    medicine: 'Obat',
    temperature: 'Suhu Tubuh',
    note: 'Catatan',
  }
  return labels[type] || type
}

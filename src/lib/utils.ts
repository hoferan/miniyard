import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isNew(createdAt: string): boolean {
  const MS_PER_DAY = 86_400_000
  return Date.now() - new Date(createdAt).getTime() < 14 * MS_PER_DAY
}

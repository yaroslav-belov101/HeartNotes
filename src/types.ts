export type Note = {
  id: number
  title: string
  details?: string
  preview?: string
  mood?: string
  date?: string
  category?: string
  tags: string[]
  personId?: number
  userId?: number
}

export type EventItem = {
  id: string
  date: Date
  title: string
  personId: number
  personName?: string
  note?: string
  emoji: string
}

export type { }

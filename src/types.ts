export interface Card {
  id: string
  title: string
  imageUrl: string
  imageId: string
  description: string
  tags: string[]
  selected: boolean
  createdAt: number
}

export type NewCard = Omit<Card, 'id' | 'createdAt' | 'selected'>

export type CardUpdate = Partial<Omit<Card, 'id' | 'createdAt'>>

export interface ExportedCard extends Card {
  imageData?: string
}

export interface FolioExport {
  version: string
  exportedAt: string
  source: 'Folio'
  cards: ExportedCard[]
}
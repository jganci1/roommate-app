export interface Profile {
  id: string
  display_name: string
  is_home: boolean
  status_updated_at: string
  created_at: string
}

export interface DayStatus {
  id: string
  user_id: string
  date: string
  status: 'home' | 'away'
  updated_at: string
}

export interface SupplyItem {
  id: string
  name: string
  quantity: number
  added_by: string
  created_at: string
  purchased: boolean
  purchased_by: string | null
  purchased_at: string | null
}

export interface Contact {
  id: string
  name: string
  role: string | null
  phone: string | null
  email: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export type RequestStatus = 'open' | 'in_progress' | 'done'

export interface RequestItem {
  id: string
  title: string
  description: string | null
  status: RequestStatus
  created_by: string
  created_at: string
  updated_at: string
}

export interface Bill {
  id: string
  category: string
  amount: number
  month: string
  notes: string | null
  created_by: string
  created_at: string
}

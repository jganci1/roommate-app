export interface Household {
  id: string
  name: string
  join_code: string
  address: string | null
  latitude: number | null
  longitude: number | null
  created_by: string | null
  created_at: string
}

export interface Profile {
  id: string
  household_id: string | null
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
  due_date: string | null
  notes: string | null
  created_by: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  event_date: string
  recurs_yearly: boolean
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Stay {
  id: string
  label: string
  start_date: string
  end_date: string
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface HouseGuide {
  id: string
  wifi_network: string | null
  wifi_password: string | null
  door_code: string | null
  house_rules: string | null
  local_tips: string | null
  emergency_info: string | null
  updated_by: string | null
  updated_at: string
}

export interface HandoffNote {
  id: string
  note: string
  resolved: boolean
  created_by: string
  created_at: string
}

export interface JournalEntry {
  id: string
  body: string
  created_by: string
  created_at: string
}

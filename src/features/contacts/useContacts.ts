import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Contact } from '../../types/database'

export type ContactInput = Pick<Contact, 'name' | 'role' | 'phone' | 'email' | 'notes'>

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContacts = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: true })
    setContacts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const addContact = async (input: ContactInput) => {
    await supabase.from('contacts').insert(input)
    await fetchContacts()
  }

  const removeContact = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id)
    await fetchContacts()
  }

  return { contacts, loading, addContact, removeContact }
}

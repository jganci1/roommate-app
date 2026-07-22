import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { ContactForm } from './ContactForm'
import { useContacts } from './useContacts'

export function ContactsPage() {
  const { contacts, loading, addContact, removeContact } = useContacts()

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Contacts</h1>
      <Card>
        <ContactForm onAdd={addContact} />
      </Card>

      {loading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-sm text-slate-500 dark:text-slate-400">Loading contacts…</span>
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState title="No contacts yet" hint="Add the property manager, cleaner, or anyone else useful." />
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map((c) => (
            <Card key={c.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-100">{c.name}</p>
                {c.role && <p className="text-xs text-slate-400 dark:text-slate-500">{c.role}</p>}
                <div className="mt-1 flex flex-col gap-0.5 text-sm text-slate-600 dark:text-slate-300">
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="hover:underline">
                      {c.phone}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="hover:underline">
                      {c.email}
                    </a>
                  )}
                </div>
                {c.notes && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.notes}</p>}
              </div>
              <button
                onClick={() => removeContact(c.id)}
                aria-label={`Remove ${c.name}`}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                ✕
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

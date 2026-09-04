const styles: Record<string, string> = {
  home: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  away: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  open: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  in_progress: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  done: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
}

const labels: Record<string, string> = {
  home: 'Home',
  away: 'Away',
  open: 'Open',
  in_progress: 'In progress',
  done: 'Done',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {labels[status] ?? status}
    </span>
  )
}

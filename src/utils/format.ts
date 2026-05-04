import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return format(date, 'HH:mm')
}

export function formatConversationTime(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd/MM/yy')
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max) + '…'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

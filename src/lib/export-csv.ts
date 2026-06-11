import type { InterviewSession, StakeholderProfile } from './store'

function escapeCsv(val: string | undefined | null): string {
  if (!val) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportSessionsCSV(sessions: InterviewSession[]) {
  const headers = ['Date', 'Stakeholder', 'Company', 'Sector', 'Status', 'Duration (min)', 'Opportunities', 'Summary']
  const rows = sessions.map(s => [
    escapeCsv(s.date),
    escapeCsv(s.stakeholder?.name),
    escapeCsv(s.stakeholder?.company),
    escapeCsv(s.stakeholder?.sector),
    escapeCsv(s.status),
    String(Math.round(s.duration / 60)),
    String(s.opportunities?.length || 0),
    escapeCsv(s.summary?.slice(0, 200)),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadFile(csv, 'mosi_sessions_export.csv', 'text/csv')
}

export function exportStakeholdersCSV(stakeholders: StakeholderProfile[]) {
  const headers = ['Name', 'Role', 'Email', 'Phone', 'Company', 'Sector', 'Employees', 'Revenue', 'Geography', 'LinkedIn']
  const rows = stakeholders.map(s => [
    escapeCsv(s.name),
    escapeCsv(s.role),
    escapeCsv(s.email),
    escapeCsv(s.phone),
    escapeCsv(s.company),
    escapeCsv(s.sector),
    escapeCsv(s.employees),
    escapeCsv(s.revenue),
    escapeCsv(s.geography),
    escapeCsv(s.linkedin),
  ])

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadFile(csv, 'mosi_stakeholders_export.csv', 'text/csv')
}

export function exportSessionJSON(session: InterviewSession) {
  const json = JSON.stringify(session, null, 2)
  downloadFile(json, `mosi_session_${session.id.slice(0, 8)}.json`, 'application/json')
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

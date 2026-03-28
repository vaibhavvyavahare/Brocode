import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdown } from '../../types'

interface TimeBreakdownChartProps {
  data: CategoryBreakdown[]
  billableHours: number
  nonBillableHours: number
}

const CATEGORY_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  work:      { color: '#32a852', label: 'Deep Work',     emoji: '💻' },
  calls:     { color: '#3b82f6', label: 'Client Calls',  emoji: '📞' },
  revisions: { color: '#e09200', label: 'Revisions',     emoji: '🔄' },
  admin:     { color: '#a855f7', label: 'Admin/Logistics', emoji: '📋' },
  scope:     { color: '#d94343', label: 'Scope Creep',   emoji: '⚠️' },
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const cfg = CATEGORY_CONFIG[d.name]
  return (
    <div style={{
      background: 'white', border: `1px solid ${cfg?.color}30`,
      borderRadius: 16, padding: '12px 16px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
    }}>
      <div style={{ 
        fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, 
        color: cfg?.color, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 
      }}>
        {cfg?.emoji} {cfg?.label}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, color: 'var(--text)', marginTop: 4, fontWeight: 700 }}>
        {d.value.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)' }}>hrs</span>
      </div>
    </div>
  )
}

export default function TimeBreakdownChart({ data, billableHours, nonBillableHours }: TimeBreakdownChartProps) {
  const chartData = data
    .filter(d => d.hours > 0)
    .map(d => ({ name: d.category, value: parseFloat(d.hours.toFixed(2)), ...CATEGORY_CONFIG[d.category] }))

  const total = billableHours + nonBillableHours

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {chartData.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>
          No stats yet.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData} cx="50%" cy="50%"
                innerRadius={65} outerRadius={95}
                paddingAngle={4} dataKey="value"
                strokeWidth={0}
                animationBegin={0}
                animationDuration={1500}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Detailed Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {chartData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 12, background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{d.label}</span>
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: d.color, fontWeight: 800 }}>
                  {d.value.toFixed(1)}h · {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            ))}
          </div>

          {/* Efficiency Bar */}
          {total > 0 && (
            <div style={{ marginTop: 24, padding: '16px', background: 'var(--surface-alt)', borderRadius: 16, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
                <span style={{ color: '#32a852' }}>BILLABLE {((billableHours/total)*100).toFixed(0)}%</span>
                <span style={{ color: 'var(--danger)' }}>OVERHEAD {((nonBillableHours/total)*100).toFixed(0)}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'white', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{
                  height: '100%',
                  background: '#32a852',
                  width: `${(billableHours / total) * 100}%`,
                  transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

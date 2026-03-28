import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface BillablePieChartProps {
  billableHours: number
  nonBillableHours: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  const label = d.name === 'billable' ? 'Billable' : 'Non-Billable'
  const color = d.name === 'billable' ? '#32a852' : '#e09200'
  return (
    <div style={{
      background: 'white', border: `1px solid ${color}30`,
      borderRadius: 16, padding: '12px 16px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
    }}>
      <div style={{ 
        fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, 
        color, fontSize: 13, 
      }}>
        {label}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, color: 'var(--text)', marginTop: 4, fontWeight: 700 }}>
        {d.value.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)' }}>hrs</span>
      </div>
    </div>
  )
}

export default function BillablePieChart({ billableHours, nonBillableHours }: BillablePieChartProps) {
  const total = billableHours + nonBillableHours
  
  const data = [
    { name: 'billable', value: billableHours, color: '#32a852', label: 'Billable' },
    { name: 'nonbillable', value: nonBillableHours, color: '#e09200', label: 'Overhead' },
  ].filter(d => d.value > 0)

  const billablePercent = total > 0 ? (billableHours / total * 100) : 0
  const overheadPercent = total > 0 ? (nonBillableHours / total * 100) : 0

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>
          No time tracked yet
        </div>
      ) : (
        <>
          <div style={{ position: 'relative', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  animationBegin={0}
                  animationDuration={900}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>
                {total.toFixed(0)}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-dim)', fontWeight: 600, marginTop: 4 }}>
                TOTAL HOURS
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#32a852', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Billable Time</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#32a852', fontWeight: 800 }}>
                {billableHours.toFixed(1)}h · {billablePercent.toFixed(0)}%
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: '#e09200', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Overhead</span>
              </div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e09200', fontWeight: 800 }}>
                {nonBillableHours.toFixed(1)}h · {overheadPercent.toFixed(0)}%
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

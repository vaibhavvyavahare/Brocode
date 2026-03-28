import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { CategoryBreakdown } from '../../types'

interface NonBillableBarChartProps {
  data: CategoryBreakdown[]
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
  const cfg = CATEGORY_CONFIG[d.payload.category]
  return (
    <div style={{
      background: 'white', 
      border: `1px solid ${cfg?.color}30`,
      borderRadius: 16, 
      padding: '12px 16px', 
      boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
    }}>
      <div style={{ 
        fontFamily: 'Plus Jakarta Sans, sans-serif', 
        fontWeight: 800, 
        color: cfg?.color, 
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 6 
      }}>
        {cfg?.emoji} {cfg?.label}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 18, color: 'var(--text)', marginTop: 4, fontWeight: 700 }}>
        {d.value.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-dim)' }}>hrs</span>
      </div>
    </div>
  )
}

export default function NonBillableBarChart({ data }: NonBillableBarChartProps) {
  const chartData = data
    .filter(d => d.hours > 0)
    .map(d => ({ 
      category: d.category, 
      value: parseFloat(d.hours.toFixed(2)),
      ...CATEGORY_CONFIG[d.category]
    }))

  if (chartData.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>
        No overhead tracked yet
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 20, bottom: 10, left: 100 }}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" horizontal={false} />
          <XAxis 
            type="number"
            tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'JetBrains Mono', fontWeight: 600 }} 
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            width={90}
            tick={(props: any) => {
              const cfg = CATEGORY_CONFIG[props.payload?.value]
              return (
                <text 
                  {...props} 
                  fill="var(--text-dim)"
                  fontSize={12}
                  fontFamily="JetBrains Mono"
                  fontWeight={600}
                  textAnchor="end"
                >
                  {cfg?.emoji} {cfg?.label}
                </text>
              )
            }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar 
            dataKey="value" 
            fill="#e09200"
            radius={[0, 8, 8, 0]}
            animationDuration={700}
            isAnimationActive={true}
          >
            {chartData.map((entry, i) => (
              <Bar key={i} dataKey="value" fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

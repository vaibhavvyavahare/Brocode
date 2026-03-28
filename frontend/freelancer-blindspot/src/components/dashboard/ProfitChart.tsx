import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface DataPoint {
  time: string
  rate: number
  logs: number
}

interface ProfitChartProps {
  data: DataPoint[]
  threshold: number
}

const CustomTooltip = ({ active, payload, threshold }: any) => {
  if (!active || !payload?.length) return null
  const rate = payload[0]?.value
  const below = rate < threshold
  return (
    <div style={{
      background: 'white', border: `1px solid ${below ? 'rgba(217,67,67,0.3)' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: 16, padding: '16px 20px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 700 }}>
        LOG #{payload[0]?.payload?.logs}
      </div>
      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 24, color: below ? 'var(--danger)' : 'var(--text)' }}>
        ₹{rate?.toLocaleString('en-IN')}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-dim)' }}>/hr</span>
      </div>
      {below && (
        <div style={{ 
          fontSize: 10, color: 'var(--danger)', marginTop: 8, 
          fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800,
          background: 'rgba(217,67,67,0.08)', padding: '4px 8px', borderRadius: 4
        }}>
          ⚠️ BELOW THRESHOLD
        </div>
      )}
    </div>
  )
}

export default function ProfitChart({ data, threshold }: ProfitChartProps) {
  const isCritical = data.length > 0 && data[data.length - 1].rate < threshold

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {data.length === 0 ? (
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>
          No data recorded yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={isCritical ? 'var(--danger)' : 'var(--accent)'} stopOpacity={0.15} />
                <stop offset="95%" stopColor={isCritical ? 'var(--danger)' : 'var(--accent)'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'JetBrains Mono', fontWeight: 600 }} 
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'JetBrains Mono', fontWeight: 600 }} 
              tickFormatter={v => `₹${v}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip threshold={threshold} />} cursor={{ stroke: 'var(--border-strong)', strokeWidth: 1 }} />
            <ReferenceLine
              y={threshold}
              stroke="var(--danger)"
              strokeDasharray="6 6"
              label={{ 
                value: `Goal: ₹${threshold}`, 
                fill: 'var(--danger)', 
                fontSize: 10, 
                fontFamily: 'JetBrains Mono',
                fontWeight: 800,
                position: 'right'
              }}
            />
            <Area
              type="monotone" dataKey="rate"
              stroke={isCritical ? 'var(--danger)' : 'var(--accent)'}
              strokeWidth={3}
              fill="url(#rateGrad)"
              dot={{ fill: 'white', stroke: isCritical ? 'var(--danger)' : 'var(--accent)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: isCritical ? 'var(--danger)' : 'var(--accent)', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

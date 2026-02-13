import { Line, LineChart, ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid } from "recharts";
import { Vital } from "@shared/schema";

interface RealtimeChartProps {
  data: Vital[];
  dataKey: keyof Vital;
  color: string;
  domain?: [number, number];
  height?: number;
  label: string;
}

export function RealtimeChart({ data, dataKey, color, domain = [0, 100], height = 200, label }: RealtimeChartProps) {
  // Format data for chart
  const chartData = data.map(d => ({
    ...d,
    time: new Date(d.timestamp || "").toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })
  })).reverse(); // Assuming API returns newest first

  return (
    <div className="w-full h-full flex flex-col bg-card/50 rounded-2xl border border-border/50 p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2 z-10">
        <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color }} />
            <span className="text-xs font-bold font-mono" style={{ color }}>
                {chartData.length > 0 ? Number(chartData[chartData.length - 1][dataKey]).toFixed(1) : "--"}
            </span>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
                dataKey="time" 
                hide={true} 
            />
            <YAxis 
              domain={domain} 
              hide={false}
              orientation="right"
              tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono'}}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', fontSize: '12px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                labelStyle={{ display: 'none' }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false} // Disable animation for true realtime feel without jumping
            />
            {/* Area fill gradient definition would go here if using AreaChart */}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Grid overlay for medical look */}
      <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" 
           style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>
    </div>
  );
}

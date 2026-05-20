"use client"

import { TrendingUp, DollarSign, Activity, Users } from "lucide-react"

export function TokenStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatBox 
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        label="TOTAL TRADES"
        value="50"
      />
      <StatBox 
        icon={<DollarSign className="h-4 w-4 text-[#39ff14]" />}
        label="VOLUME"
        value="255.55 SOL"
        valueColor="text-[#39ff14]"
      />
      <StatBox 
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        label="BUY/SELL RATIO"
        value="1.47"
      />
      <StatBox 
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        label="UNIQUE TRADERS"
        value="50"
      />
    </div>
  )
}

function StatBox({ 
  icon, 
  label, 
  value,
  valueColor = "text-foreground"
}: { 
  icon: React.ReactNode
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-mono text-[9px] uppercase text-muted-foreground">{label}</span>
      </div>
      <div className={`font-display text-xl ${valueColor}`}>
        {value}
      </div>
    </div>
  )
}

"use client" 
import { formatCurrency } from "@/lib/formatters";

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type RevenueByProductChartsProps= {
    data: {
        name: string,
        revenue: number
    }[]
}
export function RevenueByProductCharts({data} : RevenueByProductChartsProps) {
    return (
        <ResponsiveContainer width="100%" minHeight={300}>
          <PieChart>
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))" }}
              formatter={value => formatCurrency(value as number)}
            />
            <Pie
              data={data}
              label={item => item.name}
              dataKey="revenue"
              nameKey="name"
              fill="hsl(var(--primary))"
            />
          </PieChart>
        </ResponsiveContainer>
      )
}
"use client" 

import { formatNumber } from "@/lib/formatters";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

type UsersByDateChartsProps = {
    data: {
        date: string,
        totalUsers: number
    }[]
}

export function UsersByDateCharts({data}: UsersByDateChartsProps ) {
     return (
        <ResponsiveContainer width="100%" minHeight={300}>
            <BarChart data={data} width={500} height={500}>
                <CartesianGrid stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" stroke="hsl(var(--primary))" />
                <YAxis tickFormatter={tick => formatNumber(tick)} />
                <Tooltip
                    cursor={{ fill: "hsl(var(--muted))" }}
                    formatter={(value) => formatNumber(value as number)} />
                <Tooltip />
                <Bar
                    dataKey="totalUsers"
                    name="Total Customres"
                    stroke="hsl(var(--primary))"
                />
            </BarChart>
        </ResponsiveContainer>
    ) 
}
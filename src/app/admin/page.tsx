import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/db";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { OrdersByDayChart } from "./_components/charts/OrdersByDayChart";
import { Prisma } from "@prisma/client";
import { differenceInDays, differenceInMonths, differenceInWeeks, eachDayOfInterval, eachMonthOfInterval, eachWeekOfInterval, eachYearOfInterval, endOfWeek, interval, max, min, startOfDay, startOfWeek, subDays } from "date-fns";
import { UsersByDateCharts } from "./_components/charts/UsersByDateChart";
import { RevenueByProductCharts } from "./_components/charts/RevenueByProductChart";
import { ChartCard } from "./_components/ChartCard";
import { getRangeOption, RANGE_OPTIONS } from "@/lib/rangeOptions";


async function getSalesData(
    createdAfter: Date | null,
    createdBefore: Date | null
) {
    const createdAtQuery: Prisma.OrderWhereInput["createdAt"] = {}
    if (createdAfter) createdAtQuery.gte = createdAfter
    if (createdBefore) createdAtQuery.lte = createdBefore

    const [data, chartData] = await Promise.all([
        db.order.aggregate({
            _sum: { pricePaidInCents: true },
            _count: true
        }),
        db.order.findMany({
            select: { createdAt: true, pricePaidInCents: true },
            where: { createdAt: createdAtQuery },
            orderBy: { createdAt: "asc" }
        })
    ])

    const { array, format } = getChartDateArray(
        createdAfter || startOfDay(chartData[0].createdAt),
        createdBefore || new Date()
    )
    const dayArray = array.map(date => {
        return {
            date: format(date),
            totalSales: 0
        }
    })

    return {
        chartData: chartData.reduce((data, order) => {
            const formattedDate = format(order.createdAt)
            const entry = dayArray.find(day => day.date === formattedDate)
            if (entry == null) return data
            entry.totalSales += order.pricePaidInCents / 100
            return data
        }, dayArray),
        amount: (data._sum.pricePaidInCents || 0) / 100,
        numberOfSales: data._count,
    }
}

async function getUserData(
    createdAfter: Date | null,
    createdBefore: Date | null
) {
    const createdAtQuery: Prisma.UserWhereInput["createdAt"] = {}
    if (createdAfter) createdAtQuery.gte = createdAfter
    if (createdBefore) createdAtQuery.lte = createdBefore


    const [userCount, orderData, chartData] = await Promise.all([
        db.user.count(),
        db.order.aggregate({
            _sum: { pricePaidInCents: true },
            _count: true
        }),
        db.user.findMany({
            select: {
                createdAt: true,
            },
            where: { createdAt: createdAtQuery },
            orderBy: { createdAt: "asc" }
        })
    ])

    const { array, format } = getChartDateArray(
        createdAfter || startOfDay(chartData[0].createdAt),
        createdBefore || new Date()
    )
    const dayArray = array.map(date => {
        return {
            date: format(date),
            totalUsers: 0
        }
    })


    return {
        userCount,
        averageValuePerUser: userCount === 0 ? 0 : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
        chartData: chartData.reduce((data, user) => {
            const formattedDate = format(user.createdAt)
            const entry = dayArray.find(day => day.date === formattedDate)
            if (entry == null) return data
            entry.totalUsers += 1
            return data
        }, dayArray),
    }

}

async function getProductData(
    createdAfter: Date | null,
    createdBefore: Date | null
) {

    const createdAtQuery: Prisma.OrderWhereInput["createdAt"] = {}
    if (createdAfter) createdAtQuery.gte = createdAfter
    if (createdBefore) createdAtQuery.lte = createdBefore


    const [activeCount, inactiveCount, dataChart] = await Promise.all([
        db.product.count({ where: { isAvailableForPurchase: true } }),
        db.product.count({ where: { isAvailableForPurchase: false } }),
        db.product.findMany({
            select: {
                name: true,
                orders: {
                    select: { pricePaidInCents: true },
                    where: { createdAt: createdAtQuery },
                },
            },
        }),
    ])

    return {
        activeCount,
        inactiveCount,
        chartData: dataChart
            .map(product => {
                return {
                    name: product.name,
                    revenue: product.orders.reduce((sum, order) => {
                        return sum + order.pricePaidInCents / 100
                    }, 0),
                }
            })
            .filter(product => product.revenue > 0),
    }
}

export default async function AdminDashboard(
    { searchParams: {
        totalSalesRange, newCustomersRange, revenueByProductRange,
        totalSalesRangeFrom, newCustomersRangeFrom, revenueByProductRangeFrom,
        totalSalesRangeTo, newCustomersRangeTo, revenueByProductRangeTo,

    } }:
        {
            searchParams: {
                totalSalesRange?: string,
                totalSalesRangeFrom?: string,
                totalSalesRangeTo?: string,
                newCustomersRange?: string,
                newCustomersRangeFrom?: string,
                newCustomersRangeTo?: string,
                revenueByProductRange?: string
                revenueByProductRangeFrom?: string
                revenueByProductRangeTo?: string
            }
        }
) {
    const totalSalesRangeOption = getRangeOption(totalSalesRange, totalSalesRangeFrom, totalSalesRangeTo) || RANGE_OPTIONS.last_7_day;
    const totalCustomersRangeOption = getRangeOption(newCustomersRange, newCustomersRangeFrom, newCustomersRangeTo) || RANGE_OPTIONS.last_7_day;
    const totalRevenueByProductRangeOption = getRangeOption(revenueByProductRange, revenueByProductRangeFrom, revenueByProductRangeTo) || RANGE_OPTIONS.last_7_day;

    const [salesData, userData, productData] = await Promise.all([
        getSalesData(totalSalesRangeOption.startDate, totalSalesRangeOption.endDate),
        getUserData(totalCustomersRangeOption.startDate, totalCustomersRangeOption.endDate),
        getProductData(totalRevenueByProductRangeOption.startDate, totalRevenueByProductRangeOption.endDate),
    ]);

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <DashboardCard title="Sales" subtitle={`${formatNumber(salesData.numberOfSales)} Orders`} body={formatCurrency(salesData.amount)}></DashboardCard>
                <DashboardCard title="Customers" subtitle={`${formatCurrency(userData.averageValuePerUser)} Average Value`} body={formatNumber(userData.userCount)}></DashboardCard>
                <DashboardCard title="Active Products" subtitle={`${formatNumber(productData.inactiveCount)} Inactive`} body={formatNumber(productData.activeCount)}></DashboardCard>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <ChartCard
                    title="Total Sales"
                    children={<OrdersByDayChart data={salesData.chartData} />}
                    queryKey="totalSalesRange"
                    selectedRangeLabel={totalSalesRangeOption.label}
                />
                <ChartCard
                    title="Total Customres"
                    children={<UsersByDateCharts data={userData.chartData} />}
                    queryKey="newCustomersRange"
                    selectedRangeLabel={totalCustomersRangeOption.label}

                />
                <ChartCard
                    title="Revenus by product"
                    children={<RevenueByProductCharts data={productData.chartData} />}
                    queryKey="revenueByProductRange"
                    selectedRangeLabel={totalRevenueByProductRangeOption.label}
                />

            </div>
        </>
    )
}

type DashboardCardProps = {
    title: string,
    subtitle: string,
    body: string,
}

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
    return <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
            <p>{body}</p>
        </CardContent>
    </Card>
}

function getChartDateArray(startDate: Date, endDate: Date = new Date()) {
    const days = differenceInDays(endDate, startDate)
    if (days < 30) {
        return {
            array: eachDayOfInterval(interval(startDate, endDate)),
            format: formatDate,
        }
    }

    const weeks = differenceInWeeks(endDate, startDate)
    if (weeks < 30) {
        return {
            array: eachWeekOfInterval(interval(startDate, endDate)),
            format: (date: Date) => {
                const start = max([startOfWeek(date), startDate])
                const end = min([endOfWeek(date), endDate])

                return `${formatDate(start)} - ${formatDate(end)}`
            },
        }
    }

    const months = differenceInMonths(endDate, startDate)
    if (months < 30) {
        return {
            array: eachMonthOfInterval(interval(startDate, endDate)),
            format: new Intl.DateTimeFormat("en", { month: "long", year: "numeric" })
                .format,
        }
    }

    return {
        array: eachYearOfInterval(interval(startDate, endDate)),
        format: new Intl.DateTimeFormat("en", { year: "numeric" }).format,
    }
}


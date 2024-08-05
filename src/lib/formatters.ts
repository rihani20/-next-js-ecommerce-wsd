import { DiscountType } from "@prisma/client"

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
  minimumFractionDigits: 0,
})
const NUMBER_FORMATTER = new Intl.NumberFormat("en-US")
const PERCENT_FORMATTER = new Intl.NumberFormat("en-Us", { style: "percent" })
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" })
const DATE_FORMATTER = new Intl.DateTimeFormat("en", { dateStyle: "medium" })


export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number)
}

export function formatDiscountCode({ discountAmount, discountType }: { discountAmount: number, discountType: DiscountType }) {
  switch (discountType) {
    case "PERCENTAGE":
      return PERCENT_FORMATTER.format(discountAmount / 100)
    case "FIXED":
      return formatCurrency(discountAmount)
    default:
      throw new Error(` Invalid discount code type ${discountType satisfies never} `)

  }
}

export function formatDateTime(date: Date) {
  return DATE_TIME_FORMATTER.format(date);
}

export function formatDate(date: Date) {
  return DATE_FORMATTER.format(date);
}


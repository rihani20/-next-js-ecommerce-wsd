"use server"

import db from "@/db/db";
import { z } from "zod";
import { Resend } from "resend"
import OrderHistoryEmail from "@/email/OrderHistory";
import { Product } from '@prisma/client';
import { userOrderExists } from "@/app/actions/orders";
import { getDiscountAmount, usableDiscountCodeWhere } from "@/lib/dicountCodeHelpers";
import Stripe from "stripe"

const emailSchema = z.string().email()
const resend = new Resend(process.env.RESEND_API_KEY as string)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function emailOrdersHistory(prevState: unknown, formData: FormData): Promise<{ message?: string; error?: string }> {

  const result = emailSchema.safeParse(formData.get("email"))

  if (result.success == false) {
    return { error: "Invalid Email address" }
  }
  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  })


  if (user == null) {
    return {
      message:
        "Check your email to view your order history and download your products.",
    }
  }

  const orders = user.orders.map(async order => {
    return {
      ...order,
      downloadVerificationId: (
        await db.downloadVerification.create({
          data: {
            expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
            productId: order.product.id,
          },
        })
      ).id,
    }
  })

  const data = await resend.emails.send({
    from: `Support <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Order History",
    react: <OrderHistoryEmail orders={await Promise.all(orders)} />,
  })

  if (data.error) {
    return { error: "There was an error sending your email. Please try again." }
  }

  return {
    message:
      "Check your email to view your order history and download your products.",
  }
}

export async function createPaymentIntent(
  email: string,
  productId: string,
  discountCodeId?: string
) {
  const product = await db.product.findUnique({ where: { id: productId } })
  if (product == null) return { error: "Unexpected Error" }

  const discountCode =
    discountCodeId == null
      ? null
      : await db.discountCode.findUnique({
          where: { id: discountCodeId, ...usableDiscountCodeWhere(product.id) },
        })

  if (discountCode == null && discountCodeId != null) {
    return { error: "Coupon has expired" }
  }

  const existingOrder = await db.order.findFirst({
    where: { user: { email }, productId },
    select: { id: true },
  })

  if (existingOrder != null) {
    return {
      error:
        "You have already purchased this product. Try downloading it from the My Orders page",
    }
  }

  const amount =
    discountCode == null
      ? product.priceInCent
      : getDiscountAmount(discountCode, product.priceInCent)

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "USD",
    metadata: {
      productId: product.id,
      discountCodeId: discountCode?.id || null,
    },
  })

  if (paymentIntent.client_secret == null) {
    return { error: "Unknown error" }
  }

  return { clientSecret: paymentIntent.client_secret }
}
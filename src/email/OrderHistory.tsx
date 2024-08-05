import { Body, Container, Head, Hr, Html, Preview, Tailwind } from "@react-email/components";
import { Heading } from "lucide-react";
import { OrderInformation } from "./_components/OrderInformation";
import React from "react";

type OrderHistoryEmailProps = {
    orders: {
        id: string,
        createdAt: Date,
        pricePaidInCents: number,
        downloadVerificationId: string
        product: {
            name: string,
            imagePath: string,
            description: string
        },
    }[],

}

OrderHistoryEmail.PreviewProps = {

    orders: [
        {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        pricePaidInCents: 10000,
        downloadVerificationId: crypto.randomUUID(),
        product: {
            name: "purchase name 1",
            imagePath: "/products/4e3c6c2d-15de-413d-bdde-69c44dcced69-images.jpg",
            description: "lorem epsom"
        },
    },
    {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        pricePaidInCents: 50000,
        downloadVerificationId: crypto.randomUUID(),
        product: {
            name: "purchase name 2",
            imagePath: "/products/4e3c6c2d-15de-413d-bdde-69c44dcced69-images.jpg",
            description: "lorem epsom 2"
        },
    },
],
} satisfies OrderHistoryEmailProps


export default function OrderHistoryEmail({ orders }: OrderHistoryEmailProps) {
    return (
      <Html>
        <Preview>Order History & Downloads</Preview>
        <Tailwind>
          <Head />
          <Body className="font-sans bg-white">
            <Container className="max-w-xl">
              <Heading>Order History</Heading>
              {orders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <OrderInformation
                    order={order}
                    product={order.product}
                    downloadVerificationId={order.downloadVerificationId}
                  />
                  {index < orders.length - 1 && <Hr />}
                </React.Fragment>
              ))}
            </Container>
          </Body>
        </Tailwind>
      </Html>
    )
  }
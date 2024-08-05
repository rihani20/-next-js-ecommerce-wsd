import { Body, Container, Head, Html, Preview, Tailwind } from "@react-email/components";
import { Heading } from "lucide-react";
import { OrderInformation } from "./_components/OrderInformation";

type PurchaseReceiptEmailProps = {
    product: {
        name: string,
        imagePath: string,
        description: string
    },
    order: {
        id: string,
        createdAt: Date,
        pricePaidInCents: number,
    },
    downloadVerificationId: string

}

PurchaseReceiptEmail.PreviewProps = {
    product: {
        name: "purchase name",
        imagePath: "/products/4e3c6c2d-15de-413d-bdde-69c44dcced69-images.jpg",
        description: "lorem epsom"
    },
    order: {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        pricePaidInCents: 10000
    },
    downloadVerificationId: crypto.randomUUID()
} satisfies PurchaseReceiptEmailProps


export default function PurchaseReceiptEmail({ product, order, downloadVerificationId }: PurchaseReceiptEmailProps) {
    return (
        <Html>
            <Preview>Download {product.name} and vieew recipt</Preview>
            <Tailwind>
                <Head />
                <Body className="font-sans bg-white">
                    <Container className="max-w-xl">
                        <Heading>Purchase Receipt</Heading>
                        <OrderInformation order={order} product={product} downloadVerificationId={downloadVerificationId} />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}
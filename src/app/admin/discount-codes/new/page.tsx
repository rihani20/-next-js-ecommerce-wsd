import db from "@/db/db";
import { PageHeader } from "../../_components/PageHeader";
import { DiscountCodeForm } from "../_components/DiscountCodeForm";

export default async function NewDiscountCodesPage() {

    const products = await db.product.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" }
    })

    return <>
        <PageHeader>Add Coupon</PageHeader>
        <DiscountCodeForm products={products} />
    </>
}
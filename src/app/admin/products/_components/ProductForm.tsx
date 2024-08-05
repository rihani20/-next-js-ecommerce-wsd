"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/formatters"
import { Label } from "@radix-ui/react-label"
import { useState } from "react"
import { addProduct, updateProduct } from "../../_actions/products"
import { useFormState, useFormStatus } from "react-dom"
import { Product } from "@prisma/client"
import Image from "next/image"

export function ProductForm({ product }: { product?: Product | null }) {
    const [error, action] = useFormState(product == null ? addProduct : updateProduct.bind(null , product.id), {})
    const [priceInCent, setPriceInCent] = useState<number | undefined>(product?.priceInCent)

    return <form action={action} className="space-y-8">
        <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input type="text" id="name" name="name" defaultValue={product?.name || ""} required />
            {error.name && (<div className="text-destructive">{error.name}</div>)}
        </div>
        <div className="space-y-2">
            <Label htmlFor="priceInCent">Price In Cents</Label>
            <Input
                type="number"
                id="priceInCent"
                name="priceInCent"
                required
                value={priceInCent}
                onChange={e => setPriceInCent(Number(e.target.value) || undefined)}
            />
            <div className="text-muted-foreground">{formatCurrency((priceInCent || 0) / 100)}</div>
            {error.priceInCent && (<div className="text-destructive">{error.priceInCent}</div>)}

        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={product?.description || ""} required />
            {error.description && (<div className="text-destructive">{error.description}</div>)}

        </div>
        <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input type="file" id="file" name="file" required={product == null} />
            {product != null && <div className="text-muted-foreground">{product.filePath}</div>}
            {error.file && (<div className="text-destructive">{error.file}</div>)}

        </div>
        <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input type="file" id="image" name="image" required={product == null} />
            {product != null && <Image src={product.imagePath} height="400" width="400" alt={product?.name || ""} />}
            {error.image && (<div className="text-destructive">{error.image}</div>)}

        </div>
        <SubmitButton />
    </form>
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
    </Button>
}
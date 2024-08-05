import { Nav, NavLink } from "@/components/Nav"

export const dynamic = "force-dynamic" //disable caching 


export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return <>
        <Nav>
            <NavLink href="/">Home</NavLink>
            <NavLink href="/products">products</NavLink>
            <NavLink href="/orders">My Orders</NavLink>
        </Nav>
        <div className="container my-6 ">{children}</div>
    </>

}
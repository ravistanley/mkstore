// Root admin layout — passthrough only.
// Authenticated pages live in (portal)/ which has the sidebar layout.
// The login page lives in login/ and gets only this clean passthrough.
export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}

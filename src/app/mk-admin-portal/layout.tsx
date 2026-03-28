import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-mk-gray lg:pl-64 flex flex-col">
            <AdminSidebar />
            <main className="flex-1 p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminIdleTimer from "@/components/admin/AdminIdleTimer";

export default function AdminPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-muted dark:bg-background lg:pl-64 flex flex-col">
            <AdminIdleTimer />
            <AdminSidebar />
            <main className="flex-1 p-6 md:p-8">
                {children}
            </main>
        </div>
    );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Manage your Dendros workflows, surveys, and branching narratives",
    robots: {
        index: false,
        follow: false,
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

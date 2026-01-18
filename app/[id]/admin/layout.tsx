import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Editor",
    description: "Build and edit your graph-based workflows with Dendros visual editor",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

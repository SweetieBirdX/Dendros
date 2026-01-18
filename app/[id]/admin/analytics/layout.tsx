import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics",
    description: "View analytics and insights for your Dendros workflows and surveys",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
    title: {
        default: "Dendros - Graph-Based Workflow Engine",
        template: "%s | Dendros"
    },
    description: "Create interactive branching narratives and surveys with Dendros. Build complex decision trees, collect responses, and analyze user journeys.",
    keywords: ["workflow engine", "survey builder", "decision tree", "branching narrative", "graph-based", "interactive forms"],
    authors: [{ name: "Dendros" }],
    openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Dendros",
        title: "Dendros - Graph-Based Workflow Engine",
        description: "Create interactive branching narratives and surveys with Dendros",
    },
    twitter: {
        card: "summary_large_image",
        title: "Dendros - Graph-Based Workflow Engine",
        description: "Create interactive branching narratives and surveys with Dendros",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

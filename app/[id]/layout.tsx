import type { Metadata } from "next";
import { fetchDendros } from "@/lib/firestore";

type Props = {
    params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id: dendrosId } = await params;

    try {
        const dendros = await fetchDendros(dendrosId);

        if (!dendros) {
            return {
                title: "Survey Not Found",
                description: "The requested survey could not be found",
            };
        }

        return {
            title: dendros.config.title || "Survey",
            description: dendros.config.description || "Interactive survey powered by Dendros",
            openGraph: {
                title: dendros.config.title || "Survey",
                description: dendros.config.description || "Interactive survey powered by Dendros",
                type: "website",
            },
            twitter: {
                card: "summary",
                title: dendros.config.title || "Survey",
                description: dendros.config.description || "Interactive survey powered by Dendros",
            },
        };
    } catch (error) {
        return {
            title: "Survey",
            description: "Interactive survey powered by Dendros",
        };
    }
}

export default function PublicSurveyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

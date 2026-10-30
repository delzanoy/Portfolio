import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTweetData } from "../../actions";
import { caseStudies } from "../../data/caseStudies";
import KushariCaseStudy from "../../components/KushariCaseStudyV2";
import TelescopeWrapper from "../../components/TelescopeWrapper";

export async function generateStaticParams() {
    return caseStudies
        .filter(cs => cs.clickable && !cs.hidden)
        .map(cs => ({ slug: cs.id }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const cs = caseStudies.find(c => c.id === slug);
    if (!cs) return {};
    return {
        title: `${cs.title} — Case Study | Delanoy`,
        description: cs.description,
    };
}

export default async function CaseStudyPage(
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const cs = caseStudies.find(c => c.id === slug);

    if (!cs || !cs.clickable) notFound();

    const tweetData = slug === "kushari"
        ? await getTweetData("1590536251157147650")
        : undefined;

    return (
        <main className="min-h-screen bg-[#0A0A0A]">
            {slug === "kushari" && (
                <KushariCaseStudy data={cs} tweet={tweetData} />
            )}
            {slug === "telescope" && (
                <TelescopeWrapper />
            )}
        </main>
    );
}

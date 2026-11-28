// Preview of the old Kushari case study (V1), at /preview/kushari-v1. Not linked anywhere.
import { caseStudies } from "../../data/caseStudies";
import KushariCaseStudy from "../../components/KushariCaseStudy";

export default function KushariV1Preview() {
    const cs = caseStudies.find(c => c.id === "kushari")!;
    return (
        <main className="min-h-screen bg-[#0A0A0A]">
            <KushariCaseStudy data={cs} />
        </main>
    );
}

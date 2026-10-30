'use client';

import dynamic from "next/dynamic";

const TelescopeCaseStudy = dynamic(
    () => import("./telescope-src/page"),
    { ssr: false }
);

export default function TelescopeWrapper() {
    return <TelescopeCaseStudy />;
}

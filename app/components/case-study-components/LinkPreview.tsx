export default function LinkPreview({ url, title, description, domain }: { url: string; title: string; description: string; domain: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between w-full max-w-[550px] min-h-[160px] md:min-h-[180px] p-5 md:p-6 rounded-[24px] border border-[rgba(255,255,255,0.15)] bg-black/40 backdrop-blur-md hover:bg-white/5 transition-all duration-300 overflow-hidden"
        >
            <div className="space-y-3 z-10">
                <div className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                    <span>{domain}</span>
                </div>

                <h4 className="text-base md:text-lg font-[var(--font-tasa)] font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {title}
                </h4>

                <p className="text-xs md:text-sm text-white/70 font-[var(--font-geist-sans)] line-clamp-3">
                    {description}
                </p>
            </div>

            <div className="absolute top-6 right-6 text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                </svg>
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </a>
    );
}
import { motion, Variants } from "framer-motion";

const sentence =
    // `Delanoy is a product designer who designs by building. He blends strategy, UX, and code to work end-to-end—from discovery and user interviews to high-fidelity interfaces and functional prototypes. His process is driven by intuition shaped through deep thinking, rapid trials, and constant experimentation. \n He thrives in ambiguous, fast-moving environments where speed, clarity, and learning matter more than polish. Rather than over-designing upfront, he builds, tests, and refines—letting real use guide decisions. For him, interfaces are hypotheses, and behavior is the only real signal. \n His work focuses on reducing friction, simplifying complex systems, and letting the product speak for itself. When users win, the business follows. He has led zero-to-one products, redesigned failing experiences under tight timelines, and shipped production-ready demos at the intersection of design and engineering.\n Outside of work, he explores philosophy, experiments with food, and continuously iterates on his health—curious by nature, deliberate by process. \n -ChatGPT`;
    `Delanoy is a product designer who designs by building. He works end-to-end across strategy, UX, and code — from discovery and user interviews to high-fidelity interfaces and functional prototypes. His process is shaped by deep thinking, rapid trials, and constant experimentation. \n

 He thrives in ambiguous, fast-moving environments where clarity must be created and learning matters more than early polish. Rather than over-designing upfront, he builds, tests, and refines — letting real use guide decisions. Interfaces are hypotheses; behavior is the signal. \n

 His work focuses on reducing friction, simplifying complex systems, and letting the product speak for itself. When users win, the business follows. He has led zero-to-one products, redesigned failing experiences under tight timelines, and shipped production-ready demos at the intersection of design and engineering. \n

 Outside of work, he explores philosophy, experiments with food, and continuously iterates on his health — curious by nature, deliberate by process.`;

const sentenceMobile =
    // `Delanoy is a product designer who designs by building. He blends strategy, UX, and code to take products from early discovery to real, working prototypes. He thrives in ambiguity, moves fast, and values learning over polish. \n Rather than over-designing upfront, he builds, tests, and refines — letting real use guide decisions. His work focuses on reducing friction, simplifying complex systems, and shipping products that change behavior, not just opinions. \n Curious by nature. Deliberate by process. \n -ChatGPT`
    `Delanoy is a product designer who designs by building. He blends strategy, UX, and code to take products from discovery to real, working prototypes. \n

 He thrives in ambiguity, moves fast, and lets real use guide decisions. His work focuses on reducing friction, simplifying complex systems, and shipping products that change behavior. \n

 Curious by nature. Deliberate by process.`

const container: Variants = {
    hidden: { opacity: 1 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04 // Slightly faster stagger for large text
        }
    }
};

const child: Variants = {
    hidden: {
        opacity: 0,
        y: 10,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

export function Description({ className }: { className?: string }) {
    const words = sentence.split(" ");
    const wordsMobile = sentenceMobile.split(" ");

    return (
        <div
            className={`
                ${className}
                relative
                flex
                items-center
                justify-center
                overflow-hidden

                min-h-[70vh]
                px-5

                sm:min-h-[80vh]
                sm:px-8

                lg:min-h-[90vh]
            `}
        >
            {/* Desktop and Tablet Version */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="
                    relative z-10
                    hidden sm:flex flex-wrap justify-center text-center font-semibold
                    text-transparent bg-clip-text
                    gap-x-[0.25em] gap-y-[0.1em]
                    max-w-full
                    sm:max-w-[640px]
                    sm:text-lg
                    lg:max-w-[800px]
                    lg:text-xl
                "
                style={{
                    backgroundImage: "linear-gradient(120deg, #b0b9e890 , #b0b9e8bb, #FFFFFF, #b0b9e8c9, #b0b9e87a)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text"
                }}
            >
                {words.map((word, i) => {
                    if (word.includes("\n")) {
                        return <div key={i} className="w-full h-8" />;
                    }
                    return (
                        <motion.span
                            key={i}
                            variants={child}
                            className="inline-block"
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </motion.div>

            {/* Mobile Version */}
            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="
                    relative z-10
                    flex sm:hidden flex-wrap justify-center text-center font-semibold
                    text-transparent bg-clip-text
                    gap-x-[0.25em] gap-y-[0.1em]
                    max-w-full
                    text-base
                "
                style={{
                    backgroundImage: "linear-gradient(120deg, #b0b9e890 , #b0b9e8bb, #FFFFFF, #b0b9e8c9, #b0b9e87a)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text"
                }}
            >
                {wordsMobile.map((word, i) => {
                    if (word.includes("\n")) {
                        return <div key={i} className="w-full h-8" />;
                    }
                    return (
                        <motion.span
                            key={i}
                            variants={child}
                            className="inline-block"
                        >
                            {word}
                        </motion.span>
                    );
                })}
            </motion.div>
        </div>
    );
}

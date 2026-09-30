type NowPlayingBarsProps = {
    active?: boolean;
    className?: string;
};

const BARS = [
    { className: "h-full animate-eq", delay: "0ms" },
    { className: "h-2/3 animate-eq-slow", delay: "220ms" },
    { className: "h-full animate-eq", delay: "440ms" },
];

export default function NowPlayingBars({ active = false, className = "" }: NowPlayingBarsProps) {
    return (
        <span
            aria-hidden="true"
            className={`flex items-end gap-[2px] h-3 text-primary ${className}`}
        >
            {BARS.map((bar, index) => (
                <span
                    key={index}
                    style={active ? { animationDelay: bar.delay } : undefined}
                    className={`w-[3px] rounded-sm bg-current transition-transform ${
                        active ? bar.className : "scale-y-25"
                    }`}
                />
            ))}
        </span>
    );
}

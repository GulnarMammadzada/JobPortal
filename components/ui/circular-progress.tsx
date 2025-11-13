interface CircularProgressProps {
    value: number
    size?: number
    strokeWidth?: number
}

export function CircularProgress({ value, size = 100, strokeWidth = 8 }: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDashoffset = circumference - (value / 100) * circumference

    const getColor = (val: number) => {
        if (val >= 75) return "#10b981"
        if (val >= 50) return "#f59e0b"
        if (val >= 25) return "#ef4444"
        return "#6b7280"
    }

    return (
        <div style={{ position: "relative", width: size, height: size }}>
            <svg
                width={size}
                height={size}
                style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                }}
            >
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor(value)}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        transition: "stroke-dashoffset 0.35s",
                    }}
                />
            </svg>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
        <span
            style={{
                fontSize: `${size * 0.3}px`,
                fontWeight: 700,
                color: getColor(value),
            }}
        >
          {value}%
        </span>
            </div>
        </div>
    )
}

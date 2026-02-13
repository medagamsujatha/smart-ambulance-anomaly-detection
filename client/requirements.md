## Packages
recharts | For real-time medical vital sign visualization
framer-motion | For smooth state transitions and alert animations
date-fns | For formatting timestamps in medical logs
clsx | Utility for conditional class names
tailwind-merge | Utility for merging tailwind classes safely

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["Inter", "sans-serif"],
  mono: ["JetBrains Mono", "monospace"],
}
Vitals updating:
- Frontend will poll /api/patients/:id/vitals every 1s to simulate real-time monitoring since WebSocket is not specified in the strict schema.
- Charts will render the last 60 seconds of data.

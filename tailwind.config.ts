import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                aiesec: {
                    blue: "#037Ef3",
                    midBlue: "#59C2F3",
                    light: "#F3F4F7",
                },
                glass: {
                    100: "rgba(255, 255, 255, 0.1)",
                    200: "rgba(255, 255, 255, 0.2)",
                    300: "rgba(255, 255, 255, 0.3)",
                    border: "rgba(255, 255, 255, 0.2)",
                },
                neon: {
                    blue: "#00f0ff",
                    purple: "#7000ff",
                    pink: "#ff0080",
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'neon': '0 0 10px rgba(0, 240, 255, 0.7), 0 0 20px rgba(0, 240, 255, 0.5)',
            },
            keyframes: {
                scan: {
                    '0%': { top: '0%' },
                    '50%': { top: '100%' },
                    '100%': { top: '0%' },
                }
            },
            animation: {
                scan: 'scan 2s ease-in-out infinite',
            }
        },
    },
    plugins: [],
};
export default config;

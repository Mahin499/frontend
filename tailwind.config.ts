import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    light: "#f6f6f8",
                    dark: "#0d1117",
                },
                surface: {
                    light: "#ffffff",
                    dark: "#161b22",
                },
                border: {
                    light: "#e2e8f0",
                    dark: "#30363d",
                },
                primary: "#137fec",
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;

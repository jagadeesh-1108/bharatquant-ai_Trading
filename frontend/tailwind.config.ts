import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#070b14",
        surface: {
          50: "#18223c",
          100: "#121a2e",
          200: "#0d1322",
          DEFAULT: "#0d1322",
        },
        border: "#1e293b",
        bullish: "#00c076",
        bearish: "#ff3b53",
        quant: {
          cyan: "#00e5ff",
          purple: "#9d4edd",
          gold: "#f5a623",
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      }
    },
  },
  plugins: [],
};
export default config;

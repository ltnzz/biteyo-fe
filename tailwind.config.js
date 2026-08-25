/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Kanvas hangat untuk nuansa food-app: kartu putih "pop" di atas cream.
      colors: {
        cream: {
          50: "#FFFBF7",
          100: "#FFF8F0",
          200: "#FFF1E5",
          300: "#F5E6D8",
        },
      },
      // Elevasi standar: card = permukaan naik halus, soft = paling tipis,
      // pop = elemen mengambang (snackbar, modal kecil).
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.03)",
        card: "0 2px 8px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.04)",
        pop: "0 8px 30px rgba(15, 23, 42, 0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionDuration: {
        150: "150ms",
      },
    },
  },
  plugins: [],
}

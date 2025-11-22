/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 기본 색상 테마 확장
        primary: {
          light: "#C8D9E6", // 밝은 파랑
          DEFAULT: "#52739A", // 기본 파랑
          dark: "#2F4156", // 어두운 파랑
        },
        accent: "#567CBD", // 포인트 색
        background: "#344E68", // 배경색
        surface: "#7F9DBA", // 카드/컨테이너 배경
        beige: "#F5EFEB", // 베이지색
      },
    },
  },
  plugins: [],
};

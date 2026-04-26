import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 폰트 로딩 방식 수정
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "구조 해석 : 사주 분석 엔진",
  description: "당신의 사주는 성격 테스트가 아닙니다. 구조입니다. 데이터로 증명하는 당신의 행동 알고리즘.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-black">
      <head>
        {/* 포트원 결제 SDK */}
        <script src="https://cdn.iamport.kr/v1/iamport.js" async />
      </head>
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <div className="min-h-screen max-w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

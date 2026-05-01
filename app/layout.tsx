import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // 폰트 로딩 방식 수정
import { DEFAULT_SITE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const naverVerification =
  (
    process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ||
    "be0198d96618ec7b606dab2780e20d72b55b478a"
  ).trim();

export const metadata: Metadata = {
  metadataBase: new URL(DEFAULT_SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: DEFAULT_SITE_URL,
  },
  keywords: [
    "ORABIT",
    "오라빗",
    "사주 분석",
    "오행 분석",
    "에너지 분석",
    "보석 추천",
    "주얼리 추천",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: googleVerification,
    other: naverVerification
      ? {
          "naver-site-verification": naverVerification,
        }
      : undefined,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: DEFAULT_SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="bg-[#F8F4EA]">
      <body className={`${inter.className} antialiased bg-[#F8F4EA] text-[#1F2937]`}>
        <div className="min-h-screen max-w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

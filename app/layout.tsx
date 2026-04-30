import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // 폰트 로딩 방식 수정
import { DEFAULT_SITE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(DEFAULT_SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: DEFAULT_SITE_URL,
    siteName: SITE_NAME,
    type: "website",
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
    <html lang="ko" className="bg-black">
      <body className={`${inter.className} antialiased bg-black text-white`}>
        <div className="min-h-screen max-w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import GlobalProgress from "@/components/GlobalProgress";

export const metadata: Metadata = {
  title: "CampaignIQ — Smart Email Marketing Platform",
  description:
    "Plan, launch, and analyze your email marketing campaigns from one unified interface. AI-powered content, real-time analytics, and seamless audience management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <GlobalProgress />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

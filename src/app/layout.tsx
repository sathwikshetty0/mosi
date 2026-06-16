import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { LayoutShell } from "@/components/layout/layout-shell";
import { ToastContainer } from "@/components/ui/toast";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MOSI — Mapping Opportunities through Stakeholder Interviews",
  description: "Capture, transcribe, and synthesize stakeholder interviews using the CEED framework.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} font-sans antialiased bg-[#F1F2FB] text-[#1C2A3B]`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}

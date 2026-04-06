import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlacementOS — Your Interview Preparation Platform",
  description:
    "Curated DSA roadmaps, integrated code execution, AI debugging, and mock interview agents — bridge the gap between passive learning and active performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener("unhandledrejection", function(event) {
                if (event.reason && typeof event.reason === "object" && !(event.reason instanceof Error)) {
                  event.preventDefault();
                  // Stop Next.js's dev overlay from catching this spurious Monaco object
                  event.stopImmediatePropagation(); 
                }
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#050505]">
        <SessionWrapper>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}

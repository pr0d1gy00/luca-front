import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans, Geist } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/Providers";
import { OfflineProvider } from "@/components/OfflineProvider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const newsReader = Newsreader({
  variable: "--font-news-reader",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Pharmako",
  description:
    "Pharmako es una plataforma de gestión de farmacias que ofrece una solución integral para optimizar las operaciones diarias, mejorar la atención al cliente y aumentar la eficiencia en la administración de inventarios y ventas.",
  icons: [
    {
      url: "/favicon-light.svg",
      media: "(prefers-color-scheme: light)",
      type: "image/svg+xml",
    },
    {
      url: "/favicon-dark.svg",
      media: "(prefers-color-scheme: dark)",
      type: "image/svg+xml",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        newsReader.variable,
        jakarta.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <OfflineProvider>{children}</OfflineProvider>
        </Providers>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}

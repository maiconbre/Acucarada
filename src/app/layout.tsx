import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Açucarada - Doceria Artesanal",
    template: "%s | Açucarada"
  },
  description: "Descubra os melhores doces artesanais da Açucarada. Bolos, tortas, brigadeiros e muito mais, feitos com carinho e ingredientes selecionados.",
  keywords: ["doceria", "doces artesanais", "bolos", "tortas", "brigadeiros", "açucarada"],
  authors: [{ name: "Açucarada" }],
  creator: "Açucarada",
  publisher: "Açucarada",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    title: "Açucarada - Doceria Artesanal",
    description: "Descubra os melhores doces artesanais da Açucarada. Bolos, tortas, brigadeiros e muito mais, feitos com carinho e ingredientes selecionados.",
    siteName: "Açucarada",
  },
  twitter: {
    card: "summary_large_image",
    title: "Açucarada - Doceria Artesanal",
    description: "Descubra os melhores doces artesanais da Açucarada. Bolos, tortas, brigadeiros e muito mais, feitos com carinho e ingredientes selecionados.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

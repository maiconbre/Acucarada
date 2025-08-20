import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Otimização de carregamento de fonte
  preload: true,
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
      <head>
        {/* Preload de recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.whatsapp.com" />
        
        {/* Otimizações de performance */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f43f5e" />
        
        {/* Preload de imagens críticas removido - hero-image.webp não é usada */}
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning={true}>
        {children}
        <Toaster />
        <WebVitalsReporter />
      </body>
    </html>
  );
}

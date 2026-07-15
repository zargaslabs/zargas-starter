import type { Metadata } from "next";
import { Suspense } from "react";

import { RouteToastListener } from "@/components/feedback/route-toast-listener";
import { Toaster } from "@/components/ui/sonner";
import { dictionary } from "@/lib/i18n/dictionaries";

import "./globals.css";

export const metadata: Metadata = {
  title: dictionary.common.appName,
  description: "Zargas Labs iç yönetim uygulaması.", // TODO: spec'ten doldur
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Suspense fallback={null}>
          <RouteToastListener />
        </Suspense>
        {children}
        <Toaster closeButton richColors position="top-right" />
      </body>
    </html>
  );
}

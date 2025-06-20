// src/app/layout.tsx
'use client';

import AIAssistant from '@/components/AIAssistant';
import './globals.css';
import { AuthProvider } from './auth/context';
import Sidebar from '../components/Sidebar';
import { Inter } from 'next/font/google';
import React, { useState, useCallback } from 'react'; // React, useState, useCallback import edildi

const inter = Inter({ subsets: ['latin'] });

// Metadata kısmı kaldırıldı (isteğiniz üzerine)
// export const metadata = {
//   title: 'TEMSA Batarya Simülasyonu',
//   description: 'Elektrikli Otobüs Simülasyonu ve Envanter Yönetim Paneli',
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState('256px'); // Varsayılan açık sidebar genişliği (w-64)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Sidebar'ın mobil durumu

  // Sidebar'dan gelen genişlik bilgisini ve mobil durumunu yakalamak için
  const handleSidebarStateChange = useCallback((newWidth: string, mobileOpen: boolean) => {
    setSidebarWidth(newWidth);
    setIsMobileMenuOpen(mobileOpen);
  }, []);

  return (
    <html lang="tr">
      <head>
        <style>{`
          html {
            scroll-behavior: smooth; /* Sayfa içi kaydırmayı yumuşatır */
          }
          /* Sidebar genişliğini CSS değişkeni olarak ayarla */
          :root {
            --sidebar-static-width: ${sidebarWidth};
          }
          /* Masaüstünde sidebar genişliğine göre main içeriğini it */
          @media (min-width: 1024px) { /* lg breakpoint */
            body > div { /* flex kapsayıcısı */
              padding-left: var(--sidebar-static-width);
              transition: padding-left 0.3s ease-in-out; /* Yumuşak geçiş */
            }
          }
          /* Mobil menü açıkken ana içeriği kilitleme */
          ${
            isMobileMenuOpen
              ? `
            body {
              overflow: hidden; /* Mobil menü açıkken body kaydırmayı engelle */
            }
          `
              : ''
          }
        `}</style>
      </head>
      {/* Genel arka plan ve metin rengi body'e verildi */}
      <body
        className={
          inter.className +
          ' bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
        }
      >
        <AuthProvider>
          {/* Ana Layout Kapsayıcısı: Sidebar ve İçeriği yan yana konumlandırır */}
          <div className="flex min-h-screen">
            {/* Sidebar bileşeni, state değişikliğini parent'a (RootLayout'a) bildiriyor */}
            <Sidebar onStateChange={handleSidebarStateChange} />

            {/* Ana İçerik Alanı: Geriye kalan tüm alanı kaplar ve kendi içinde kaydırılabilir olur */}
            {/* Masaüstünde padding-left artık CSS değişkeni ile ayarlandığı için inline style'a gerek yok */}
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
          {/* AIAssistant genelde en dışta veya footer yakınında olur */}
          <AIAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}

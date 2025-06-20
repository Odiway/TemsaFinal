// src/app/layout.tsx
'use client';

import AIAssistant from '@/components/AIAssistant';
import './globals.css';
import { AuthProvider } from './auth/context';
import Sidebar from '../components/Sidebar';
import { Inter } from 'next/font/google';
import React, { useState, useCallback } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Sidebar'ın anlık genişliğini tutan state
  const [sidebarWidth, setSidebarWidth] = useState('256px');
  // Mobil menünün açık olup olmadığını tutan state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sidebar'dan gelen state değişikliklerini yakalamak için callback
  const handleSidebarStateChange = useCallback((newWidth: string, mobileOpen: boolean) => {
    setSidebarWidth(newWidth);
    setIsMobileMenuOpen(mobileOpen);
  }, []);

  return (
    <html lang="tr">
      <head>
        {/* Sayfa içi gezinti için yumuşak kaydırma */}
        <style>{`
          html {
            scroll-behavior: smooth;
          }
          /* CSS değişkeni tanımlayarak sidebar genişliğini global olarak erişilebilir yapıyoruz */
          :root {
            --sidebar-static-width: ${sidebarWidth};
          }
          /* Masaüstü görünümünde (lg breakpoint ve üzeri) ana içeriğe sidebar kadar padding ekle */
          /* Bu, ana içeriğin sidebar'ın arkasına kaymasını engeller */
          @media (min-width: 1024px) {
            /* body > div: flex kapsayıcımız olan div'i temsil eder */
            body > div {
              padding-left: var(--sidebar-static-width);
              transition: padding-left 0.3s ease-in-out; /* Genişlik değişimleri için yumuşak geçiş */
            }
          }
          /* Mobil menü açıkken sayfa kaydırmayı engelle (arka plan içeriğinin kaymasını önler) */
          ${
            isMobileMenuOpen
              ? `
            body {
              overflow: hidden;
            }
          `
              : ''
          }
        `}</style>
      </head>
      <body
        className={
          inter.className +
          ' bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100'
        }
      >
        <AuthProvider>
          {/* Ana layout yapısı: Sidebar ve içerik için esnek kutu */}
          {/* min-h-screen ile div'in en az viewport yüksekliği kadar olmasını sağla */}
          <div className="flex min-h-screen">
            {/* Sidebar bileşeni, state değişikliklerini bildirir */}
            <Sidebar onStateChange={handleSidebarStateChange} />

            {/* Ana içerik alanı */}
            {/* flex-1: Kalan alanı doldurmasını sağlar */}
            {/* overflow-y-auto: İçerik taştığında dikey kaydırma çubuğu ekler */}
            {/* Bu 'main' etiketinin de min-h-screen'i miras alması veya dolaylı olarak alması önemlidir */}
            <main className="flex-1 overflow-y-auto">
              {children} {/* Sayfa bileşenleri burada render edilir */}
            </main>
          </div>
          {/* AI Asistanı bileşeni */}
          <AIAssistant />
        </AuthProvider>
      </body>
    </html>
  );
}

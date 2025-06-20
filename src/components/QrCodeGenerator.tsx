// src/app/components/QrCodeGenerator.tsx
'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // qrcode.react kütüphanesini kullanıyoruz

interface QrCodeGeneratorProps {
  value: string; // QR koduna gömülecek veri (örn. rackId'nin URL'si)
  size?: number; // QR kodunun boyutu (px)
  level?: 'L' | 'M' | 'Q' | 'H'; // Hata düzeltme seviyesi
  bgColor?: string; // Arka plan rengi
  fgColor?: string; // Ön plan rengi
  id?: string; // Canvas elementi için ID (indirme için)
}

const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({
  value,
  size = 128,
  level = 'H',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  id,
}) => {
  return (
    <QRCodeCanvas
      id={id}
      value={value}
      size={size}
      level={level}
      bgColor={bgColor}
      fgColor={fgColor}
      // Gerekirse resim veya başka özel ayarlar eklenebilir
    />
  );
};

export default QrCodeGenerator;

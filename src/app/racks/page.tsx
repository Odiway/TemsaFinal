// src/app/racks/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react'; // <-- Burası düzeltildi: QRCode yerine QRCodeCanvas
import { PlusCircle, QrCode, Trash2, Edit2, Package, MapPin, Tag } from 'lucide-react';

// Rack veri yapısı için bir interface
interface Rack {
  _id: string;
  rackId: string;
  name: string;
  location: string;
  description?: string;
  qrCodeUrl?: string; // Bu alanın varlığını desteklemek için ekledik (şimdilik kullanılmıyor olabilir)
  createdAt: string;
  updatedAt: string;
}

const RacksPage: React.FC = () => {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newRackData, setNewRackData] = useState({ name: '', location: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  // QR kodlarının yönlendireceği ana URL. Kendi yerel IP adresinizi buraya yazın.
  const BASE_QR_URL = 'https://temsa-final-ag81.vercel.app'; // <-- BURAYI DEĞİŞTİRDİK! Kendi IP'niz ve portunuz

  const fetchRacks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/racks');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Rack[] = await response.json();
      setRacks(data);
    } catch (err: any) {
      console.error('Failed to fetch racks:', err);
      setError('Raflar yüklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRacks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRackData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/racks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRackData),
      });
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorDetail.message || response.statusText}`,
        );
      }
      setNewRackData({ name: '', location: '', description: '' });
      setShowAddForm(false);
      await fetchRacks();
      alert('Raf başarıyla eklendi!');
    } catch (err: any) {
      console.error('Failed to add rack:', err);
      alert('Raf eklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRack = async (rackId: string, rackName: string) => {
    if (
      !confirm(
        `"${rackName}" adlı rafı ve içerisindeki TÜM ürünleri silmek istediğinizden emin misiniz?`,
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/racks/${rackId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorDetail.message || response.statusText}`,
        );
      }
      await fetchRacks();
      alert('Raf başarıyla silindi!');
    } catch (err: any) {
      console.error('Failed to delete rack:', err);
      alert('Raf silinemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = (rackId: string) => {
    const canvas = document.getElementById(`qrcode-${rackId}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `rack-${rackId}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-4">
          <Package className="w-10 h-10 text-cyan-400" />
          Raf Yönetim Paneli
        </h1>

        {/* Ekleme Formu */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700/50">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-600 transition-all duration-300"
          >
            <PlusCircle className="w-5 h-5" /> Yeni Raf Ekle
          </button>

          {showAddForm && (
            <form onSubmit={handleAddRack} className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-slate-300 text-sm font-medium mb-1">
                  Raf Adı
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newRackData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-slate-300 text-sm font-medium mb-1">
                  Konum
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newRackData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-slate-300 text-sm font-medium mb-1"
                >
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newRackData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-y"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-600 transition-all duration-300"
              >
                {loading ? 'Ekleniyor...' : 'Rafı Kaydet'}
              </button>
            </form>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-800/30 border border-red-500/50 text-red-300 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Package className="w-7 h-7 text-cyan-400" />
            Mevcut Raflar
          </h2>
          {loading && !racks.length ? (
            <p className="text-slate-400">Raflar yükleniyor...</p>
          ) : racks.length === 0 ? (
            <p className="text-slate-400">Henüz hiç raf eklenmedi.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {racks.map((rack) => (
                <div
                  key={rack._id}
                  className="bg-slate-900/80 rounded-lg p-6 border border-slate-700/50 shadow-lg flex flex-col gap-3"
                >
                  <h3 className="text-xl font-semibold text-cyan-300">{rack.name}</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {rack.location}
                  </p>
                  {rack.description && <p className="text-slate-300 text-sm">{rack.description}</p>}
                  <p className="text-slate-500 text-xs">ID: {rack.rackId}</p>

                  {/* QR Kodu */}
                  <div className="flex justify-center my-4">
                    <QRCodeCanvas
                      value={`${BASE_QR_URL}/racks/${rack.rackId}`}
                      size={128}
                      level="H"
                      id={`qrcode-${rack.rackId}`}
                    />{' '}
                    {/* <-- BURAYI DEĞİŞTİRDİK! */}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Link
                      href={`/racks/${rack.rackId}`}
                      className="flex-1 text-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-md hover:bg-blue-500/30 transition-colors duration-200 text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Ürünleri Yönet
                    </Link>
                    <button
                      onClick={() => downloadQrCode(rack.rackId)}
                      className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-md hover:bg-purple-500/30 transition-colors duration-200 text-sm flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" /> QR İndir
                    </button>
                    <button
                      onClick={() => handleDeleteRack(rack.rackId, rack.name)}
                      className="px-4 py-2 bg-red-500/20 text-red-300 rounded-md hover:bg-red-500/30 transition-colors duration-200 text-sm flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RacksPage;

// src/app/racks/[rackId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react'; // <-- qrcode.react importu düzeltildi, QRCodeCanvas olarak
import { Package, MapPin, Tag, PlusCircle, Edit2, Trash2, ArrowLeft } from 'lucide-react';

// Rack veri yapısı için bir interface
interface Rack {
  _id: string;
  rackId: string;
  name: string;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Item veri yapısı için bir interface
interface Item {
  _id: string;
  rackId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  status: string;
  addedBy: string;
  addedAt: string;
  lastEditedAt: string;
}

const RackDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const rackId = params.rackId as string;

  const [rack, setRack] = useState<Rack | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemData, setNewItemData] = useState({
    productCode: '',
    productName: '',
    quantity: '',
    unit: '',
    status: 'Mevcut',
  });
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const fetchRackAndItems = async () => {
    if (!rackId) return;
    setLoading(true);
    try {
      const rackResponse = await fetch(`/api/racks/${rackId}`);
      if (!rackResponse.ok) {
        throw new Error(`Failed to fetch rack: ${rackResponse.status}`);
      }
      const rackData: Rack = await rackResponse.json();
      setRack(rackData);

      const itemsResponse = await fetch(`/api/racks/${rackId}/items`);
      if (!itemsResponse.ok) {
        throw new Error(`Failed to fetch items: ${itemsResponse.status}`);
      }
      const itemsData: Item[] = await itemsResponse.json();
      setItems(itemsData);
    } catch (err: any) {
      console.error('Error fetching rack or items:', err);
      setError('Detaylar yüklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rackId) {
      fetchRackAndItems();
    }
  }, [rackId]);

  const handleNewItemInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rackId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/racks/${rackId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorDetail.message || response.statusText}`,
        );
      }
      setNewItemData({
        productCode: '',
        productName: '',
        quantity: '',
        unit: '',
        status: 'Mevcut',
      });
      setShowAddItemForm(false);
      await fetchRackAndItems();
      alert('Ürün başarıyla eklendi!');
    } catch (err: any) {
      console.error('Failed to add item:', err);
      alert('Ürün eklenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItemClick = (item: Item) => {
    setEditingItem(item);
    setNewItemData({
      productCode: item.productCode,
      productName: item.productName,
      quantity: item.quantity.toString(),
      unit: item.unit,
      status: item.status,
    });
    setShowAddItemForm(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !rackId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/racks/${rackId}/items/${editingItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorDetail.message || response.statusText}`,
        );
      }
      setEditingItem(null);
      setNewItemData({
        productCode: '',
        productName: '',
        quantity: '',
        unit: '',
        status: 'Mevcut',
      });
      setShowAddItemForm(false);
      await fetchRackAndItems();
      alert('Ürün başarıyla güncellendi!');
    } catch (err: any) {
      console.error('Failed to update item:', err);
      alert('Ürün güncellenemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!rackId) return;
    if (!confirm(`"${itemName}" adlı ürünü silmek istediğinizden emin misiniz?`)) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/racks/${rackId}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorDetail = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status} - ${errorDetail.message || response.statusText}`,
        );
      }
      await fetchRackAndItems();
      alert('Ürün başarıyla silindi!');
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      alert('Ürün silinemedi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !rack)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xl">
        Raf yükleniyor...
      </div>
    );
  if (error)
    return <div className="min-h-screen bg-slate-950 p-8 text-red-400 text-xl">Hata: {error}</div>;
  if (!rack)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xl">
        Raf bulunamadı.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-800/70 border border-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/70 transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" /> Raflara Geri Dön
        </button>

        <h1 className="text-4xl font-bold text-white mb-6 flex items-center gap-4">
          <Package className="w-10 h-10 text-cyan-400" />
          Raf Detayı: {rack.name}
        </h1>

        {/* Raf Bilgileri */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 text-sm">
          <p>
            <span className="font-semibold text-slate-200">Konum:</span> {rack.location}
          </p>
          <p>
            <span className="font-semibold text-slate-200">ID:</span> {rack.rackId}
          </p>
          {rack.description && (
            <p className="col-span-full">
              <span className="font-semibold text-slate-200">Açıklama:</span> {rack.description}
            </p>
          )}
          <p>
            <span className="font-semibold text-slate-200">Oluşturulma:</span>{' '}
            {new Date(rack.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold text-slate-200">Son Güncelleme:</span>{' '}
            {new Date(rack.updatedAt).toLocaleString()}
          </p>
          <div className="col-span-full flex justify-center mt-4">
            <QRCodeCanvas
              value={`http://localhost:3000/racks/${rack.rackId}`}
              size={160}
              level="H"
            />{' '}
            {/* QR kodu burada göster */}
          </div>
        </div>

        {/* Ürün Ekleme/Düzenleme Formu */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700/50">
          <button
            onClick={() => {
              setShowAddItemForm(!showAddItemForm);
              setEditingItem(null); // Formu açarken düzenleme modundan çık
              setNewItemData({
                productCode: '',
                productName: '',
                quantity: '',
                unit: '',
                status: 'Mevcut',
              });
            }}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-500 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-600 transition-all duration-300"
          >
            <PlusCircle className="w-5 h-5" /> {editingItem ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </button>

          {showAddItemForm && (
            <form
              onSubmit={editingItem ? handleUpdateItem : handleAddItem}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="productName"
                  className="block text-slate-300 text-sm font-medium mb-1"
                >
                  Ürün Adı
                </label>
                <input
                  type="text"
                  id="productName"
                  name="productName"
                  value={newItemData.productName}
                  onChange={handleNewItemInputChange}
                  required
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label
                  htmlFor="productCode"
                  className="block text-slate-300 text-sm font-medium mb-1"
                >
                  Ürün Kodu (Opsiyonel)
                </label>
                <input
                  type="text"
                  id="productCode"
                  name="productCode"
                  value={newItemData.productCode}
                  onChange={handleNewItemInputChange}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-slate-300 text-sm font-medium mb-1"
                  >
                    Miktar
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={newItemData.quantity}
                    onChange={handleNewItemInputChange}
                    required
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-slate-300 text-sm font-medium mb-1">
                    Birim
                  </label>
                  <input
                    type="text"
                    id="unit"
                    name="unit"
                    value={newItemData.unit}
                    onChange={handleNewItemInputChange}
                    required
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white placeholder-slate-400"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status" className="block text-slate-300 text-sm font-medium mb-1">
                  Durum
                </label>
                <select
                  id="status"
                  name="status"
                  value={newItemData.status}
                  onChange={handleNewItemInputChange}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-md text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="Mevcut">Mevcut</option>
                  <option value="Kullanımda">Kullanımda</option>
                  <option value="Hasarlı">Hasarlı</option>
                  <option value="Düşük Stok">Düşük Stok</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-600 transition-all duration-300"
              >
                {loading ? 'Kaydediliyor...' : editingItem ? 'Ürünü Güncelle' : 'Ürünü Ekle'}
              </button>
            </form>
          )}
        </div>

        {/* Ürün Listesi */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 border border-slate-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Tag className="w-7 h-7 text-cyan-400" />
            Raftaki Ürünler ({items.length})
          </h2>
          {loading && !items.length ? (
            <p className="text-slate-400">Ürünler yükleniyor...</p>
          ) : items.length === 0 ? (
            <p className="text-slate-400">Bu rafta henüz ürün bulunmamaktadır.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      Ürün Adı
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      Kodu
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      Miktar
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      Birim
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      Durum
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      Eylemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-700/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-slate-200">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">
                        {item.productCode || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-200">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-300 text-sm">
                        {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === 'Mevcut'
                              ? 'bg-green-500/20 text-green-300'
                              : item.status === 'Kullanımda'
                                ? 'bg-blue-500/20 text-blue-300'
                                : item.status === 'Hasarlı'
                                  ? 'bg-red-500/20 text-red-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditItemClick(item)}
                          className="text-cyan-400 hover:text-cyan-500 mr-3"
                        >
                          <Edit2 className="w-4 h-4 inline-block" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id, item.productName)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4 inline-block" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RackDetailPage;

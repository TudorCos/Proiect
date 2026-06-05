import { useState, useEffect } from 'react';
import { User, Package, ClipboardList, Wrench, Pencil, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import { useBuildStore } from '@/store';
import type { Order } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-zinc-700/50 text-zinc-400',
  confirmed: 'bg-blue-400/10 text-blue-400',
  processing: 'bg-rose-500/10 text-sky-400',
  shipped: 'bg-blue-400/10 text-blue-400',
  delivered: 'bg-emerald-500/10 text-emerald-500',
  cancelled: 'bg-red-500/10 text-red-400',
};

const statusLabels: Record<string, string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmat',
  processing: 'Se procesează',
  shipped: 'Expediat',
  delivered: 'Livrat',
  cancelled: 'Anulat',
};

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const savedBuilds = useBuildStore((s) => s.savedBuilds);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editStreet, setEditStreet] = useState(user?.address?.street || '');
  const [editCity, setEditCity] = useState(user?.address?.city || '');
  const [editCounty, setEditCounty] = useState(user?.address?.county || '');
  const [editPostalCode, setEditPostalCode] = useState(user?.address?.postalCode || '');
  const [editPassword, setEditPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Orders from DB
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`http://localhost:5216/api/Orders?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserOrders(data);
      }
    } catch (err) {
      console.error('Eroare la încărcarea comenzilor:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMsg('');

    try {
      if (editPostalCode && !/^\d{6}$/.test(editPostalCode)) {
        setSaveMsg('Codul poștal nu este valid (exact 6 cifre).');
        setSaving(false);
        return;
      }

      const updatedUser = {
        ...user,
        name: editName,
        phone: editPhone || null,
        address: {
          street: editStreet || null,
          city: editCity || null,
          county: editCounty || null,
          postalCode: editPostalCode || null,
          country: 'România',
        },
        ...(editPassword ? { password: editPassword } : {}),
      };

      const res = await fetch(`http://localhost:5216/api/Users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        setUser({ ...user, name: editName, phone: editPhone || undefined, address: { street: editStreet, city: editCity, county: editCounty, postalCode: editPostalCode, country: 'România' } });
        setSaveMsg('Profil actualizat cu succes!');
        setEditing(false);
        setEditPassword('');
      } else {
        setSaveMsg('Eroare la salvare. Încearcă din nou.');
      }
    } catch (err) {
      console.error(err);
      setSaveMsg('Eroare de conexiune la server.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-zinc-950 min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-5">
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4 text-sky-400" />
          <h1 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Contul meu</h1>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* Profile sidebar */}
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-200">{user.name}</p>
                    <p className="text-[11px] text-zinc-500">{user.email}</p>
                  </div>
                </div>
                {!editing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-sky-400"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Edit mode */}
              {editing ? (
                <div className="border-t border-zinc-800 pt-3 space-y-2">
                  <div>
                    <Label className="text-[11px] text-zinc-500">Nume</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-zinc-500">Telefon</Label>
                    <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="07XX XXX XXX" className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-zinc-500">Stradă</Label>
                    <Input value={editStreet} onChange={(e) => setEditStreet(e.target.value)} className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] text-zinc-500">Oraș</Label>
                      <Input value={editCity} onChange={(e) => setEditCity(e.target.value)} className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[11px] text-zinc-500">Județ</Label>
                      <Input value={editCounty} onChange={(e) => setEditCounty(e.target.value)} className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] text-zinc-500">Cod Poștal</Label>
                    <Input value={editPostalCode} onChange={(e) => setEditPostalCode(e.target.value)} className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                  </div>
                  <div>
                    <Label className="text-[11px] text-zinc-500">Parolă nouă (lasă gol dacă nu vrei să o schimbi)</Label>
                    <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="••••••••" className="mt-0.5 bg-zinc-800 border-zinc-700 h-8 text-xs" />
                  </div>

                  {saveMsg && (
                    <p className={`text-[11px] px-2 py-1 rounded ${saveMsg.includes('succes') ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>{saveMsg}</p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" disabled={saving} className="bg-sky-500 hover:bg-sky-600 text-white text-xs h-7 gap-1" onClick={handleSaveProfile}>
                      <Save className="h-3 w-3" />
                      {saving ? 'Se salvează...' : 'Salvează'}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs text-zinc-500 h-7 gap-1" onClick={() => { setEditing(false); setSaveMsg(''); }}>
                      <X className="h-3 w-3" />
                      Anulează
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-zinc-800 pt-3 space-y-1.5">
                  {user.phone && (
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Telefon</span>
                      <span className="text-zinc-300">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Oraș</span>
                        <span className="text-zinc-300">{user.address.city}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-500">Județ</span>
                        <span className="text-zinc-300">{user.address.county}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Rol</span>
                    <Badge className={`text-[10px] ${user.role === 'admin' ? 'bg-rose-500/10 text-sky-400 border-sky-400/20' : 'bg-zinc-700/50 text-zinc-400 border-zinc-700'}`}>
                      {user.role}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Membru din</span>
                    <span className="text-zinc-300">{new Date(user.createdAt).toLocaleDateString('ro-RO')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-200">{userOrders.length}</p>
                <p className="text-[10px] text-zinc-500">Comenzi</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-zinc-200">{savedBuilds.length}</p>
                <p className="text-[10px] text-zinc-500">Build-uri</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-5">
            {/* Order history */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <ClipboardList className="h-3.5 w-3.5 text-sky-400" />
                <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Istoric comenzi</h2>
              </div>

              {loadingOrders ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-zinc-500">Se încarcă comenzile...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <Package className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-600">Nu ai nicio comandă încă.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {userOrders.map((order) => (
                    <div key={order.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-zinc-300">{order.id.slice(0, 8)}...</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-zinc-200">{order.total.toLocaleString('ro-RO')} RON</p>
                          <p className="text-[10px] text-zinc-600">{new Date(order.createdAt).toLocaleDateString('ro-RO')}</p>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        {order.items.map((item) => (
                          <div key={item.productId} className="flex justify-between text-[11px]">
                            <span className="text-zinc-500">
                              {item.quantity}× {item.productName}
                            </span>
                            <span className="text-zinc-400">{(item.price * item.quantity).toLocaleString('ro-RO')} RON</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[10px] text-zinc-600">
                        <span>📍 {order.shippingAddress.city}</span>
                        <span>💳 {order.paymentMethod === 'card' ? 'Card' : 'Ramburs'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved builds */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <Wrench className="h-3.5 w-3.5 text-sky-400" />
                <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Build-uri salvate</h2>
              </div>

              {savedBuilds.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-zinc-600">Nu ai build-uri salvate. Creează unul în PC Builder.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {savedBuilds.map((build) => (
                    <div key={build.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-zinc-300">{build.name}</p>
                        <p className="text-[10px] text-zinc-600">
                          Salvat pe {build.savedAt ? new Date(build.savedAt).toLocaleDateString('ro-RO') : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-zinc-200">{build.totalPrice.toLocaleString('ro-RO')} RON</p>
                        <Badge className={`text-[10px] ${build.isCompatible ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {build.isCompatible ? 'Compatibil' : 'Incompatibil'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

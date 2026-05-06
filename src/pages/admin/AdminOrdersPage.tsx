import { useState, useEffect } from 'react';
import { ClipboardList, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Order, OrderStatus } from '@/types';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-zinc-700/50 text-zinc-400',
  confirmed: 'bg-blue-400/10 text-blue-400',
  processing: 'bg-rose-500/10 text-sky-400',
  shipped: 'bg-blue-400/10 text-blue-400',
  delivered: 'bg-emerald-500/10 text-emerald-500',
  cancelled: 'bg-red-500/10 text-red-400',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'În așteptare',
  confirmed: 'Confirmat',
  processing: 'Se procesează',
  shipped: 'Expediat',
  delivered: 'Livrat',
  cancelled: 'Anulat',
};

const allStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5216/api/Orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Eroare la încărcarea comenzilor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`http://localhost:5216/api/Orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStatus),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error('Eroare la actualizarea statusului:', err);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.userId.toLowerCase().includes(q);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xs text-zinc-500">Se încarcă comenzile din baza de date...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-zinc-100">
          <ClipboardList className="h-4 w-4 inline mr-2 text-sky-400" />
          Comenzi
          <span className="text-xs text-zinc-500 font-normal ml-2">{filtered.length} comenzi • {totalRevenue.toLocaleString('ro-RO')} RON</span>
        </h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută ID comandă..."
            className="pl-8 h-8 bg-zinc-900 border-zinc-800 text-xs"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="appearance-none h-8 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300 pl-3 pr-7 cursor-pointer"
          >
            <option value="">Toate statusurile</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Status chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {allStatuses.map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          if (count === 0) return null;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`text-[10px] px-2.5 py-1 rounded-full transition-colors ${
                statusFilter === status
                  ? statusColors[status] + ' ring-1 ring-current'
                  : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              {statusLabels[status]} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-[80px_1fr_120px_100px_120px_100px] gap-2 px-4 py-2.5 text-[10px] text-zinc-600 uppercase tracking-wider border-b border-zinc-800">
          <span>ID</span>
          <span>Client</span>
          <span>Produse</span>
          <span className="text-right">Total</span>
          <span className="text-center">Status</span>
          <span className="text-right">Data</span>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {filtered.map((order) => (
            <div key={order.id}>
              <div
                className="grid md:grid-cols-[80px_1fr_120px_100px_120px_100px] gap-2 px-4 py-3 items-center hover:bg-zinc-800/20 cursor-pointer transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <span className="text-xs text-sky-400 font-mono">{order.id.slice(0, 8)}</span>
                <div>
                  <p className="text-xs text-zinc-200">{order.userId.slice(0, 12)}...</p>
                  <p className="text-[10px] text-zinc-600">{order.shippingAddress?.city}, {order.shippingAddress?.county}</p>
                </div>
                <span className="text-xs text-zinc-400">{order.items.length} produse</span>
                <span className="text-sm font-bold text-zinc-200 text-right">{order.total.toLocaleString('ro-RO')} RON</span>
                <div className="text-center">
                  <Badge className={`text-[10px] ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <span className="text-[11px] text-zinc-500 text-right">
                  {new Date(order.createdAt).toLocaleDateString('ro-RO')}
                </span>
              </div>

              {/* Expanded details */}
              {expandedOrder === order.id && (
                <div className="px-4 pb-3 bg-zinc-800/10">
                  <div className="border border-zinc-800/50 rounded p-3 space-y-1.5">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Detalii comandă</p>
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">{item.quantity}× {item.productName}</span>
                        <span className="text-zinc-300">{(item.price * item.quantity).toLocaleString('ro-RO')} RON</span>
                      </div>
                    ))}
                    <div className="border-t border-zinc-800/50 pt-1.5 mt-1.5 flex justify-between text-xs">
                      <span className="text-zinc-400">Total</span>
                      <span className="font-bold text-zinc-200">{order.total.toLocaleString('ro-RO')} RON</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-[10px] text-zinc-600">
                      <span>📍 {order.shippingAddress?.street}, {order.shippingAddress?.city}</span>
                      <span>💳 {order.paymentMethod === 'card' ? 'Card online' : 'Ramburs'}</span>
                      <span>🕐 Actualizat: {new Date(order.updatedAt).toLocaleDateString('ro-RO')}</span>
                    </div>

                    {/* Status update */}
                    <div className="border-t border-zinc-800/50 pt-2 mt-2">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">Actualizează status</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {allStatuses.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, s); }}
                            className={`text-[10px] px-2 py-1 rounded transition-colors ${
                              order.status === s
                                ? statusColors[s] + ' ring-1 ring-current'
                                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {statusLabels[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-600">Nicio comandă găsită.</div>
        )}
      </div>
    </div>
  );
}

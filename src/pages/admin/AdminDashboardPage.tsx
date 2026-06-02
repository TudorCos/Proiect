import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ClipboardList, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Order, Product, User } from '@/types';

export function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          fetch('http://localhost:5216/api/Products'),
          fetch('http://localhost:5216/api/Orders'),
          fetch('http://localhost:5216/api/Users'),
        ]);

        if (productsRes.ok) setProducts(await productsRes.json());
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  const stats = [
    {
      title: 'Produse',
      value: products.length.toString(),
      icon: Package,
      delta: '',
      deltaType: 'up' as const,
    },
    {
      title: 'Comenzi active',
      value: activeOrders.toString(),
      icon: ClipboardList,
      delta: '',
      deltaType: 'up' as const,
    },
    {
      title: 'Utilizatori',
      value: users.filter((u) => u.role === 'customer').length.toString(),
      icon: Users,
      delta: '',
      deltaType: 'up' as const,
    },
    {
      title: 'Venituri',
      value: `${totalRevenue.toLocaleString('ro-RO')} RON`,
      icon: TrendingUp,
      delta: '',
      deltaType: 'up' as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-xs text-zinc-500">Se încarcă datele din baza de date...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-zinc-100 mb-5">
        <LayoutDashboard className="h-4 w-4 inline mr-2 text-sky-400" />
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{stat.title}</span>
              <stat.icon className="h-3.5 w-3.5 text-zinc-600" />
            </div>
            <div className="text-xl font-bold text-zinc-100">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Comenzi recente</h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-300">{order.id.slice(0, 8)}</p>
                  <p className="text-[10px] text-zinc-600">{order.items.length} produse • {new Date(order.createdAt).toLocaleDateString('ro-RO')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-200">{order.total.toLocaleString('ro-RO')} RON</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-500' :
                    order.status === 'shipped' ? 'bg-blue-400/10 text-blue-400' :
                    order.status === 'processing' ? 'bg-rose-500/10 text-sky-400' :
                    'bg-zinc-700/50 text-zinc-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-500">Nicio comandă în baza de date.</div>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Stoc scăzut
              <span className="ml-2 text-[10px] text-sky-400 font-normal">({lowStockProducts.length} produse)</span>
            </h2>
          </div>
          <div className="divide-y divide-zinc-800/50">
            {lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-300 truncate max-w-[200px]">{product.name}</p>
                  <p className="text-[10px] text-zinc-600">{product.category} • {product.brand}</p>
                </div>
                <span className={`text-xs font-bold ${product.stock <= 5 ? 'text-red-400' : 'text-sky-400'}`}>
                  {product.stock} buc
                </span>
              </div>
            ))}
            {lowStockProducts.length === 0 && products.length > 0 && (
              <div className="p-4 text-center text-xs text-emerald-500">Toate produsele sunt în stoc.</div>
            )}
            {products.length === 0 && (
              <div className="p-4 text-center text-xs text-zinc-500">Niciun produs în baza de date.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

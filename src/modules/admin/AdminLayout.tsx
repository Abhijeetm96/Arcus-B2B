import React, { useState } from 'react';
import * as perm from '../../core/permissions/permissions';

export type AdminRole = perm.AdminRole;

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  setActiveSection: (section: any) => void;
  currentRole: AdminRole;
  setCurrentRole: (role: AdminRole) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeSection,
  setActiveSection,
  currentRole,
  setCurrentRole
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Command Center Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    products: any[];
    orders: any[];
    rfqs: any[];
    customers: any[];
    brands: any[];
  }>({ products: [], orders: [], rfqs: [], customers: [], brands: [] });

  // Handle Ctrl+K / Cmd+K keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults({ products: [], orders: [], rfqs: [], customers: [], brands: [] });
      return;
    }

    setSearchLoading(true);
    try {
      const token = localStorage.getItem('arcus_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Products
      const prodRes = await fetch('http://localhost:5000/api/admin/products', { headers });
      let prods: any[] = [];
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          if (prodData.length > 0 && 'products' in prodData[0]) {
            prodData.forEach((c: any) => prods.push(...c.products));
          } else {
            prods = prodData;
          }
        }
      }

      // 2. Fetch Orders
      const orderRes = await fetch('http://localhost:5000/api/admin/orders', { headers });
      let orders: any[] = [];
      if (orderRes.ok) orders = await orderRes.json();

      // 3. Fetch RFQs
      const rfqRes = await fetch('http://localhost:5000/api/rfqs', { headers });
      let rfqs: any[] = [];
      if (rfqRes.ok) rfqs = await rfqRes.json();

      // 4. Fetch Customers
      const custRes = await fetch('http://localhost:5000/api/admin/users', { headers });
      let customers: any[] = [];
      if (custRes.ok) {
        const users = await custRes.json();
        customers = users.filter((u: any) => u.role !== 'Admin');
      }

      // 5. Fetch Brands
      const brandRes = await fetch('http://localhost:5000/api/brands', { headers });
      let brands: any[] = [];
      if (brandRes.ok) brands = await brandRes.json();

      // Filter locally
      const query = val.toLowerCase();
      const filteredProds = prods.filter(p => p.name?.toLowerCase().includes(query) || p.sku?.toLowerCase().includes(query)).slice(0, 5);
      const filteredOrders = orders.filter(o => String(o.id).toLowerCase().includes(query) || o.status?.toLowerCase().includes(query) || o.userId?.toLowerCase().includes(query)).slice(0, 5);
      const filteredRfqs = rfqs.filter(r => String(r.id).toLowerCase().includes(query) || r.title?.toLowerCase().includes(query) || r.status?.toLowerCase().includes(query)).slice(0, 5);
      const filteredCustomers = customers.filter(c => {
        const name = c.fullName || c.full_name || c.name || '';
        const email = c.email || '';
        const phone = c.phone || c.phoneNumber || '';
        const gst = c.gstNumber || '';
        return name.toLowerCase().includes(query) || email.toLowerCase().includes(query) || phone.toLowerCase().includes(query) || gst.toLowerCase().includes(query);
      }).slice(0, 5);
      const filteredBrands = brands.filter(b => b.name?.toLowerCase().includes(query) || b.id?.toLowerCase().includes(query)).slice(0, 5);

      setSearchResults({
        products: filteredProds,
        orders: filteredOrders,
        rfqs: filteredRfqs,
        customers: filteredCustomers,
        brands: filteredBrands
      });
    } catch (err) {
      console.error('Error during Command Center search:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const roles: AdminRole[] = [
    'SUPER_ADMIN',
    'OPERATIONS_MANAGER',
    'INVENTORY_MANAGER',
    'SALES_MANAGER',
    'CUSTOMER_SUPPORT'
  ];

  const simulatedUser = { role: 'ADMIN', adminRole: currentRole };

  // Define sidebar menu items with permission checks
  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: 'dashboard', 
      isGroup: false,
      check: () => true 
    },
    {
      id: 'catalog-group',
      name: 'Catalog Management',
      icon: 'category',
      isGroup: true,
      check: (u: any) => perm.canManageProducts(u),
      subItems: [
        { id: 'products', name: 'Products', icon: 'inventory_2', check: (u: any) => perm.canManageProducts(u) },
        { id: 'categories', name: 'Categories', icon: 'account_tree', check: (u: any) => perm.canManageProducts(u) },
        { id: 'brands', name: 'Brands', icon: 'verified', check: (u: any) => perm.canManageProducts(u) },
        { id: 'import-products', name: 'Import Products', icon: 'upload_file', check: (u: any) => perm.canManageProducts(u) },
        { id: 'export-products', name: 'Export Products', icon: 'download', check: (u: any) => perm.canManageProducts(u) },
        { id: 'bulk-updates', name: 'Bulk Updates', icon: 'published_with_changes', check: (u: any) => perm.canManageProducts(u) }
      ]
    },
    {
      id: 'inventory-group',
      name: 'Inventory',
      icon: 'warehouse',
      isGroup: true,
      check: (u: any) => perm.canViewInventory(u),
      subItems: [
        { id: 'inventory-overview', name: 'Overview', icon: 'dashboard_customize', check: (u: any) => perm.canViewInventory(u) },
        { id: 'stock-adjustments', name: 'Stock Adjustments', icon: 'settings_backup_restore', check: (u: any) => perm.canEditInventory(u) }
      ]
    },
    { 
      id: 'orders', 
      name: 'Orders', 
      icon: 'shopping_cart', 
      isGroup: false,
      check: (u: any) => perm.canApproveRFQs(u) || perm.canViewInventory(u) 
    },
    { 
      id: 'rfqs', 
      name: 'RFQs Workspace', 
      icon: 'request_quote', 
      isGroup: false,
      check: (u: any) => perm.canApproveRFQs(u) 
    },
    { 
      id: 'customers', 
      name: 'Customers', 
      icon: 'group', 
      isGroup: false,
      check: (u: any) => perm.canManageCustomers(u) 
    },
    { 
      id: 'search-analytics', 
      name: 'Search Analytics', 
      icon: 'analytics', 
      isGroup: false,
      check: (u: any) => perm.canManageProducts(u) 
    },
    { 
      id: 'reports', 
      name: 'Reports & Export', 
      icon: 'description', 
      isGroup: false,
      check: (u: any) => perm.canViewReports(u) 
    },
    { 
      id: 'audit-logs', 
      name: 'Audit Logs', 
      icon: 'history', 
      isGroup: false,
      check: (u: any) => perm.canManageAdmins(u) 
    },
    { 
      id: 'role-mgmt', 
      name: 'Roles & Permissions', 
      icon: 'admin_panel_settings', 
      isGroup: false,
      check: (u: any) => perm.canManageAdmins(u) 
    },
    { 
      id: 'settings', 
      name: 'Settings', 
      icon: 'settings', 
      isGroup: false,
      check: (u: any) => perm.canManageSettings(u) 
    }
  ];

  const notifications = [
    { id: 1, title: 'Low Stock Alert', desc: 'Astral CPVC Pipe 3m is below reorder level (6 left).', time: '10 mins ago', type: 'warning' },
    { id: 2, title: 'New RFQ Received', desc: 'Cement RFQ (#rfq_9381) submitted by ACC Builders.', time: '1 hour ago', type: 'info' },
    { id: 3, title: 'Order Dispatched', desc: 'Order #ord_7362 has been dispatched to Karan Mehra.', time: '2 hours ago', type: 'success' }
  ];

  const getFriendlyRoleName = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-200 w-64 flex-shrink-0 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-64 absolute md:relative'}`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-lg border-b border-slate-800">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[#FFC107] text-[28px] font-bold">bubble_chart</span>
            <span className="font-extrabold text-lg tracking-wider text-white">ARCUS <span className="text-[#FFC107] text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">ADMIN</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">menu_open</span>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-md px-sm space-y-xs">
          {menuItems.map((item) => {
            if (!item.check(simulatedUser)) return null;

            if (item.isGroup) {
              const visibleSubItems = item.subItems?.filter(sub => sub.check(simulatedUser)) || [];
              if (visibleSubItems.length === 0) return null;

              return (
                <div key={item.id} className="space-y-xs pt-xs">
                  <div className="px-md py-xs text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[12px]">{item.icon}</span>
                    {item.name}
                  </div>
                  {visibleSubItems.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSection(sub.id)}
                      className={`w-full flex items-center gap-md px-md py-sm rounded-xl text-body-sm font-semibold transition-all ${
                        activeSection === sub.id
                          ? 'bg-[#FFC107] text-slate-950 shadow-sm shadow-[#FFC107]/20 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{sub.icon}</span>
                      {sub.name}
                    </button>
                  ))}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-md px-md py-sm rounded-xl text-body-sm font-semibold transition-all ${
                  activeSection === item.id
                    ? 'bg-[#FFC107] text-slate-950 shadow-sm shadow-[#FFC107]/20 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-md border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-sm">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[#FFC107] font-bold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-bold text-white truncate">Administrator</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{getFriendlyRoleName(currentRole)}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-lg shadow-sm sticky top-0 z-20">
          {/* Left: Hamburger & Page Title */}
          <div className="flex items-center gap-md">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 hover:text-slate-950">
                <span className="material-symbols-outlined">menu</span>
              </button>
            )}
            <h2 className="text-headline-h6 font-extrabold text-slate-900 capitalize">
              {activeSection.replace('-', ' ')}
            </h2>
          </div>

          {/* Right: Role Simulator, Notifications, Profile */}
          <div className="flex items-center gap-md">
            {/* Command Search Bar Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-sm px-md h-10 w-64 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 text-xs transition-all select-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Search Command...</span>
              <kbd className="ml-auto bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono">Ctrl+K</kbd>
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all border border-slate-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>
            {/* Role Switcher Simulator */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="flex items-center gap-xs px-md py-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
              >
                <span className="material-symbols-outlined text-[16px] text-[#FFC107]">supervised_user_circle</span>
                Role: {getFriendlyRoleName(currentRole)}
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>
              {showRoleSelector && (
                <div className="absolute right-0 mt-sm w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-sm">
                  <div className="px-md py-xs text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Simulate Admin Role
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setCurrentRole(r);
                        setShowRoleSelector(false);
                      }}
                      className={`w-full text-left px-md py-sm text-body-sm font-semibold flex items-center justify-between transition-colors ${
                        currentRole === r ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {getFriendlyRoleName(r)}
                      {currentRole === r && (
                        <span className="material-symbols-outlined text-[#FFC107] text-[16px]">check_circle</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center relative transition-all border border-slate-200"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-sm w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-md py-md bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-body-sm text-slate-900">Platform Notifications</span>
                    <span className="text-[10px] font-bold bg-amber-500/10 text-[#FFC107] px-md py-0.5 rounded-full">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-md hover:bg-slate-50 transition-colors flex gap-sm">
                        <span className={`material-symbols-outlined text-[18px] mt-0.5 ${
                          n.type === 'warning' ? 'text-amber-500' :
                          n.type === 'success' ? 'text-green-500' : 'text-blue-500'
                        }`}>
                          {n.type === 'warning' ? 'warning' : n.type === 'success' ? 'check_circle' : 'info'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm font-bold text-slate-900">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Back to Site Button */}
            <a
              href="#/"
              className="flex items-center gap-xs px-md h-10 border border-slate-200 hover:border-slate-800 text-slate-600 hover:text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Exit Dashboard
            </a>
          </div>
        </header>

        {/* Content Box */}
        <main className="flex-1 p-lg overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Command Center Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 p-md sm:p-lg flex justify-center items-start pt-16">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={() => setIsSearchOpen(false)}
          ></div>

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[75vh]">
            {/* Input Header */}
            <div className="p-md border-b border-slate-200 flex items-center gap-md">
              <span className="material-symbols-outlined text-slate-400 text-[24px]">search</span>
              <input
                type="text"
                autoFocus
                placeholder="Search products, orders, RFQs, customers, brands..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 h-10 bg-transparent border-0 outline-hidden focus:ring-0 text-body-md font-medium text-slate-800 placeholder-slate-400"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Results Body */}
            <div className="flex-1 overflow-y-auto p-md space-y-md">
              {searchLoading ? (
                <div className="flex flex-col justify-center items-center py-xl space-y-md">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FFC107]"></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Searching dashboard...</p>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="text-center py-xl text-slate-400 space-y-sm">
                  <span className="material-symbols-outlined text-[40px] text-slate-300">bubble_chart</span>
                  <p className="font-extrabold text-body-xs uppercase tracking-wider text-slate-400">ARCUS Command Center Search</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Start typing to search across catalog products, RFQ worksheets, customer profiles, order history, and brands.</p>
                </div>
              ) : (searchResults.products.length === 0 && 
                   searchResults.orders.length === 0 && 
                   searchResults.rfqs.length === 0 && 
                   searchResults.customers.length === 0 && 
                   searchResults.brands.length === 0) ? (
                <div className="text-center py-xl text-slate-400 space-y-sm">
                  <span className="material-symbols-outlined text-[40px] text-slate-300">search_off</span>
                  <p className="font-semibold text-body-sm">No results match "{searchQuery}"</p>
                  <p className="text-xs text-slate-400">Try searching for other keywords, SKU numbers, or status terms.</p>
                </div>
              ) : (
                <div className="space-y-md text-left">
                  {/* Products Results */}
                  {searchResults.products.length > 0 && (
                    <div className="space-y-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-xs px-sm">
                        <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                        Products ({searchResults.products.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        {searchResults.products.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveSection('products');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-md bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-slate-400 text-[10px]">SKU: {p.sku} | Brand: {p.brand}</p>
                            </div>
                            <span className="font-black text-amber-600">{p.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RFQs Results */}
                  {searchResults.rfqs.length > 0 && (
                    <div className="space-y-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-xs px-sm">
                        <span className="material-symbols-outlined text-[14px]">request_quote</span>
                        RFQs ({searchResults.rfqs.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        {searchResults.rfqs.map(r => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setActiveSection('rfqs');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-md bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{r.title || 'RFQ Worksheet'}</p>
                              <p className="text-slate-400 text-[10px]">ID: {r.id} | Buyer: {r.buyerId}</p>
                            </div>
                            <span className="px-md py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              {r.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders Results */}
                  {searchResults.orders.length > 0 && (
                    <div className="space-y-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-xs px-sm">
                        <span className="material-symbols-outlined text-[14px]">shopping_cart</span>
                        Orders ({searchResults.orders.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        {searchResults.orders.map(o => (
                          <button
                            key={o.id}
                            onClick={() => {
                              setActiveSection('orders');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-md bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-slate-900">Order #{o.id}</p>
                              <p className="text-slate-400 text-[10px]">Customer: {o.userId} | Placed: {o.createdAt}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-black text-slate-900">₹{o.totalAmount || o.totalPrice}</p>
                              <span className="text-[9px] font-extrabold uppercase text-slate-500">{o.status}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customers Results */}
                  {searchResults.customers.length > 0 && (
                    <div className="space-y-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-xs px-sm">
                        <span className="material-symbols-outlined text-[14px]">group</span>
                        Customers ({searchResults.customers.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        {searchResults.customers.map(c => (
                          <button
                            key={c.id || c.email}
                            onClick={() => {
                              setActiveSection('customers');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-md bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{c.fullName || c.full_name || c.name}</p>
                              <p className="text-slate-400 text-[10px]">{c.email} | {c.phone || 'No Phone'}</p>
                            </div>
                            <span className="px-md py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                              {c.customerType || 'INDIVIDUAL'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brands Results */}
                  {searchResults.brands.length > 0 && (
                    <div className="space-y-sm">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-xs px-sm">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Brands ({searchResults.brands.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                        {searchResults.brands.map(b => (
                          <button
                            key={b.id}
                            onClick={() => {
                              setActiveSection('brands');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-md bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{b.name}</p>
                              <p className="text-slate-400 text-[10px]">{b.description || 'No description'}</p>
                            </div>
                            <span className="text-[9px] font-extrabold uppercase text-green-600">{b.status}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="p-sm bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
              Tip: Press <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">Esc</kbd> to dismiss.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { apiFetch } from '../../lib/api';
import * as perm from '../../core/permissions/permissions';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { cn } from '../../components/ui/utils';
import * as Lucide from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type AdminRole = perm.AdminRole;

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  setActiveSection: (section: any) => void;
  currentRole: AdminRole;
  setCurrentRole: (role: AdminRole) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  dashboard: Lucide.LayoutDashboard,
  category: Lucide.FolderTree,
  inventory_2: Lucide.Layers,
  account_tree: Lucide.GitFork,
  verified: Lucide.ShieldCheck,
  upload_file: Lucide.Upload,
  download: Lucide.Download,
  published_with_changes: Lucide.RefreshCw,
  warehouse: Lucide.Warehouse,
  dashboard_customize: Lucide.Grid,
  settings_backup_restore: Lucide.Undo2,
  shopping_cart: Lucide.ShoppingCart,
  request_quote: Lucide.FileText,
  group: Lucide.Users,
  analytics: Lucide.BarChart,
  description: Lucide.FileCode,
  history: Lucide.History,
  admin_panel_settings: Lucide.ShieldAlert,
  settings: Lucide.Settings,
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeSection,
  setActiveSection,
  currentRole,
  setCurrentRole
}) => {
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

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
      // 1. Fetch Products
      const prodRes = await apiFetch('/admin/products');
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
      const orderRes = await apiFetch('/admin/orders');
      let orders: any[] = [];
      if (orderRes.ok) orders = await orderRes.json();

      // 3. Fetch RFQs
      const rfqRes = await apiFetch('/rfqs');
      let rfqs: any[] = [];
      if (rfqRes.ok) rfqs = await rfqRes.json();

      // 4. Fetch Customers
      const custRes = await apiFetch('/admin/users');
      let customers: any[] = [];
      if (custRes.ok) {
        const users = await custRes.json();
        customers = users.filter((u: any) => u.role !== 'Admin');
      }

      // 5. Fetch Brands
      const brandRes = await apiFetch('/brands');
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
        { id: 'brands', name: 'Brands', icon: 'verified', check: (u: any) => perm.canManageProducts(u) }
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
      id: 'orders-group',
      name: 'Orders & Bookings',
      icon: 'shopping_cart',
      isGroup: true,
      check: (u: any) => perm.canApproveRFQs(u) || perm.canViewInventory(u),
      subItems: [
        { id: 'orders-b2b', name: 'B2B Orders', icon: 'warehouse', check: (u: any) => perm.canApproveRFQs(u) || perm.canViewInventory(u) },
        { id: 'orders-b2c', name: 'B2C Orders', icon: 'group', check: (u: any) => perm.canApproveRFQs(u) || perm.canViewInventory(u) },
        { id: 'orders-services', name: 'Service Bookings', icon: 'settings', check: (u: any) => perm.canApproveRFQs(u) || perm.canViewInventory(u) }
      ]
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-lg tracking-wider text-white">
            ARCUS <span className="text-primary text-xs font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">ADMIN</span>
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-none">
        {menuItems.map((item) => {
          if (!item.check(simulatedUser)) return null;

          if (item.isGroup) {
            const visibleSubItems = item.subItems?.filter(sub => sub.check(simulatedUser)) || [];
            if (visibleSubItems.length === 0) return null;
            const GroupIcon = iconMap[item.icon] || Lucide.HelpCircle;

            if (item.id === 'orders-group') {
              const isHovered = hoveredGroupId === item.id;
              const hasActiveSub = visibleSubItems.some(sub => activeSection === sub.id);
              return (
                <div 
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHoveredGroupId(item.id)}
                  onMouseLeave={() => setHoveredGroupId(null)}
                >
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all text-left",
                      hasActiveSub
                        ? 'bg-primary text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    )}
                  >
                    <GroupIcon className="h-4 w-4" />
                    <span className="flex-1">Orders</span>
                    <Lucide.ChevronRight className="h-3.5 w-3.5 text-slate-500 opacity-60 shrink-0" />
                  </button>

                  {isHovered && (
                    <div 
                      className="absolute left-full top-0 ml-1.5 py-1 w-44 bg-slate-950 border border-slate-800 rounded-md shadow-xl z-50 text-left animate-in fade-in slide-in-from-left-2 duration-150"
                      onMouseEnter={() => setHoveredGroupId(item.id)}
                      onMouseLeave={() => setHoveredGroupId(null)}
                    >
                      {visibleSubItems.map(sub => {
                        const SubIcon = iconMap[sub.icon] || Lucide.HelpCircle;
                        const displayName = sub.name === 'B2C Orders' ? 'B@C Orders' : sub.name === 'Service Bookings' ? 'Services Order' : sub.name;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setActiveSection(sub.id);
                              setHoveredGroupId(null);
                            }}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold transition-all text-left",
                              activeSection === sub.id
                                ? 'bg-primary text-slate-950 font-bold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                            )}
                          >
                            <SubIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>{displayName}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="space-y-1 pt-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <GroupIcon className="h-3 w-3" />
                  {item.name}
                </div>
                {visibleSubItems.map((sub) => {
                  const SubIcon = iconMap[sub.icon] || Lucide.HelpCircle;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSection(sub.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded text-sm font-semibold transition-all ${
                        activeSection === sub.id
                          ? 'bg-primary text-slate-950 shadow-sm font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <SubIcon className="h-4 w-4" />
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            );
          }

          const ItemIcon = iconMap[item.icon] || Lucide.HelpCircle;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-sm font-semibold transition-all ${
                activeSection === item.id
                  ? 'bg-primary text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ItemIcon className="h-4 w-4" />
              {item.name}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-primary font-bold text-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">Administrator</p>
            <p className="text-[10px] text-slate-500 font-mono truncate">{getFriendlyRoleName(currentRole)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const breadcrumbs = [
    { label: 'Admin Portal', href: '#/portal/admin' },
    { label: activeSection.replace('-', ' ') }
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      {/* Command Search Bar Trigger */}
      <button
        onClick={() => setIsSearchOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 h-10 w-64 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 rounded text-slate-400 text-xs transition-all select-none cursor-pointer"
      >
        <Lucide.Search className="h-4 w-4 text-slate-400" />
        <span>Search Command...</span>
        <kbd className="ml-auto bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono">Ctrl+K</kbd>
      </button>

      {/* Role Switcher Simulator */}
      <div className="relative">
        <button
          onClick={() => setShowRoleSelector(!showRoleSelector)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-all border border-slate-200"
        >
          <Lucide.Users className="h-3.5 w-3.5 text-primary" />
          Role: {getFriendlyRoleName(currentRole)}
          <Lucide.ChevronDown className="h-3 w-3" />
        </button>
        {showRoleSelector && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded shadow-md z-50 py-1">
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Simulate Admin Role
            </div>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setCurrentRole(r);
                  setShowRoleSelector(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentRole === r ? 'bg-amber-50 text-amber-900 font-bold' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                {getFriendlyRoleName(r)}
                {currentRole === r && (
                  <Lucide.Check className="h-3.5 w-3.5 text-primary" />
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
          className="w-10 h-10 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center relative transition-all border border-slate-200"
        >
          <Lucide.Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded shadow-md z-50 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="font-bold text-xs text-slate-900">Platform Notifications</span>
              <span className="text-[10px] font-bold bg-amber-500/10 text-primary px-2 py-0.5 rounded-full">3 New</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors flex gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900">{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.desc}</p>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Out */}
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          await logout();
          window.location.hash = '#/auth?tab=login';
        }}
        className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-200"
      >
        <Lucide.LogOut className="h-3.5 w-3.5" />
        Log Out
      </Button>
    </div>
  );

  return (
    <PageLayout
      sidebar={sidebarContent}
      breadcrumbItems={breadcrumbs}
      title={activeSection.replace('-', ' ')}
      actions={headerActions}
      className="bg-slate-50"
    >
      {children}

      {/* Command Center Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50 p-4 flex justify-center items-start pt-16">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity cursor-pointer animate-in fade-in duration-200"
            onClick={() => setIsSearchOpen(false)}
          ></div>

          <div className="relative w-full max-w-2xl bg-white rounded shadow border border-slate-200 overflow-hidden flex flex-col max-h-[75vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Lucide.Search className="text-slate-400 h-5 w-5" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, orders, RFQs, customers, brands..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 h-10 bg-transparent border-0 outline-none focus:ring-0 text-sm font-medium text-slate-800 placeholder-slate-400"
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="w-7 h-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                <Lucide.X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {searchLoading ? (
                <div className="flex flex-col justify-center items-center py-8 space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Searching dashboard...</p>
                </div>
              ) : !searchQuery.trim() ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <p className="font-extrabold text-xs uppercase tracking-wider text-slate-400">ARCUS Command Center Search</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Start typing to search across catalog products, RFQ worksheets, customer profiles, order history, and brands.</p>
                </div>
              ) : (searchResults.products.length === 0 && 
                   searchResults.orders.length === 0 && 
                   searchResults.rfqs.length === 0 && 
                   searchResults.customers.length === 0 && 
                   searchResults.brands.length === 0) ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <p className="font-semibold text-sm">No results match "{searchQuery}"</p>
                  <p className="text-xs text-slate-400">Try searching for other keywords, SKU numbers, or status terms.</p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {/* Products Results */}
                  {searchResults.products.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 px-2">
                        <Lucide.Layers className="h-3.5 w-3.5" />
                        Products ({searchResults.products.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden shadow-xs">
                        {searchResults.products.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setActiveSection('products');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-3 bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
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
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 px-2">
                        <Lucide.FileText className="h-3.5 w-3.5" />
                        RFQs ({searchResults.rfqs.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden shadow-xs">
                        {searchResults.rfqs.map(r => (
                          <button
                            key={r.id}
                            onClick={() => {
                              setActiveSection('rfqs');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-3 bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{r.title || 'RFQ Worksheet'}</p>
                              <p className="text-slate-400 text-[10px]">ID: {r.id} | Buyer: {r.buyerId}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              {r.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders Results */}
                  {searchResults.orders.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 px-2">
                        <Lucide.ShoppingCart className="h-3.5 w-3.5" />
                        Orders ({searchResults.orders.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden shadow-xs">
                        {searchResults.orders.map(o => (
                          <button
                            key={o.id}
                            onClick={() => {
                              setActiveSection('orders');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-3 bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
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
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 px-2">
                        <Lucide.Users className="h-3.5 w-3.5" />
                        Customers ({searchResults.customers.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden shadow-xs">
                        {searchResults.customers.map(c => (
                          <button
                            key={c.id || c.email}
                            onClick={() => {
                              setActiveSection('customers');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-3 bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
                          >
                            <div>
                              <p className="font-bold text-slate-900">{c.fullName || c.full_name || c.name}</p>
                              <p className="text-slate-400 text-[10px]">{c.email} | {c.phone || 'No Phone'}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                              {c.customerType || 'INDIVIDUAL'}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Brands Results */}
                  {searchResults.brands.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 px-2">
                        <Lucide.ShieldCheck className="h-3.5 w-3.5" />
                        Brands ({searchResults.brands.length})
                      </h4>
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded overflow-hidden shadow-xs">
                        {searchResults.brands.map(b => (
                          <button
                            key={b.id}
                            onClick={() => {
                              setActiveSection('brands');
                              setIsSearchOpen(false);
                            }}
                            className="w-full p-3 bg-white hover:bg-slate-50 transition-colors flex justify-between items-center text-xs text-left cursor-pointer"
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

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium">
              Tip: Press <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">Esc</kbd> to dismiss.
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

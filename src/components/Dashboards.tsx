import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { sanitizeText } from '../../shared/validation';

interface OrderItem {
  name: string;
  qty: number;
  price: number;
  image?: string;
}

interface ClientOrder {
  id: string;
  date?: string;
  timestamp?: string;
  products?: string;
  status: string;
  amount: string | number;
  items: OrderItem[];
  shippingAddress?: string;
  billingAddress?: string;
  gstNumber?: string;
  paymentMethod?: string;
}

const parseAmount = (amtStr: string | number) => {
  if (typeof amtStr === 'number') return amtStr;
  if (!amtStr) return 0;
  const cleanStr = amtStr.replace(/[^\d.]/g, '');
  const val = parseFloat(cleanStr);
  return isNaN(val) ? 0 : val;
};

interface Coupon {
  code: string;
  points: number;
  discountValue: number;
  date: string;
  used: boolean;
}

interface ServiceBooking {
  id: string;
  serviceName: string;
  provider: string;
  date: string;
  status: string;
  amount: string;
}

interface Rfq {
  id?: string;
  name: string;
  phone: string;
  category?: string;
  quantity?: number;
  location?: string;
  timeline?: string;
  details?: string;
  timestamp?: string;
}

const DashboardContainer: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-xl space-y-md">
        <span className="material-symbols-outlined text-[64px] text-secondary">lock</span>
        <h2 className="font-headline-h2 text-[28px] text-[#0A0A0A] font-bold">Access Restrained</h2>
        <p className="text-secondary text-sm max-w-md">Please sign in to view your personalized ARCUS dashboard.</p>
        <a
          href="#/auth?tab=login"
          className="px-xl py-3 bg-[#FFC107] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#fabd00] transition-colors shadow"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-lg md:px-xxl py-xl md:py-xxl text-left">
      <div className="border-b border-[#E9ECEF] pb-md mb-xl">
        <div className="flex justify-between items-end">
          <div className="space-y-xs">
            <h1 className="font-headline-h1 text-[32px] text-[#0A0A0A] font-extrabold">{title}</h1>
            <p className="text-secondary text-xs">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-body-md md:text-body-lg font-bold text-[#0A0A0A]">{user.name}</p>
            <p className="text-[10px] text-secondary font-label-caps uppercase tracking-wider font-bold">{user.role} Account</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export const IndividualDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { addToCart } = useCart();
  
  const getSubTab = () => {
    const hash = window.location.hash;
    const cleanHash = hash.replace(/^#\/?/, '').split('?')[0];
    const segments = cleanHash.split('/');
    if (segments[0] === 'account') {
      const tab = segments[1] || 'overview';
      if (tab === 'order') {
        return 'order-detail';
      }
      if (tab === 'rfqs' && user && !['Business', 'Contractor', 'Supplier'].includes(user.role)) {
        return 'overview';
      }
      if (['addresses', 'email', 'phone', 'region'].includes(tab)) {
        return 'settings';
      }
      return tab;
    }
    return 'overview';
  };

  const getSelectedOrderId = () => {
    const hash = window.location.hash;
    const cleanHash = hash.replace(/^#\/?/, '').split('?')[0];
    const segments = cleanHash.split('/');
    if (segments[0] === 'account' && segments[1] === 'order') {
      return segments[2] || null;
    }
    return null;
  };

  const activeTab = getSubTab();
  const selectedOrderId = getSelectedOrderId();

  const setActiveTab = (tab: string) => {
    // eslint-disable-next-line react-hooks/immutability
    window.location.hash = `#/account/${tab}`;
  };

  const viewOrderDetail = (orderId: string) => {
    // eslint-disable-next-line react-hooks/immutability
    window.location.hash = `#/account/order/${orderId}`;
  };

  const goBackToOrders = () => {
    window.location.hash = `#/account/orders`;
  };

  const [orderSearch, setOrderSearch] = React.useState('');
  const [orderStatusFilter, setOrderStatusFilter] = React.useState('All');
  const [serviceSearch, setServiceSearch] = React.useState('');
  const [serviceStatusFilter, setServiceStatusFilter] = React.useState('All');
  const [showRepeatOrderModal, setShowRepeatOrderModal] = React.useState(false);
  const [repeatToast, setRepeatToast] = React.useState<string | null>(null);
  const [ordersList, setOrdersList] = useState<ClientOrder[]>([]);
  const [cancelTimeLeft, setCancelTimeLeft] = useState<number>(0);

  useEffect(() => {
    const order = ordersList.find(o => o.id === selectedOrderId);
    if (!order || order.status === 'Cancelled') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCancelTimeLeft(0);
      return;
    }

    const pm = (order.paymentMethod || '').toLowerCase();
    const isCOD = pm.includes('cash') || pm.includes('delivery') || pm.includes('cod');
    const isB2BCredit = pm.includes('credit');
    const isPrepaid = !isCOD && !isB2BCredit;

    if (!isPrepaid) {
      setCancelTimeLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const orderTime = new Date(order.timestamp || '').getTime();
      const elapsedMs = Date.now() - orderTime;
      const totalMs = 30 * 60 * 1000;
      const remainingMs = totalMs - elapsedMs;
      return remainingMs > 0 ? Math.floor(remainingMs / 1000) : 0;
    };

    const initialLeft = calculateTimeLeft();
    setCancelTimeLeft(initialLeft);

    if (initialLeft <= 0) return;

    const interval = setInterval(() => {
      const left = calculateTimeLeft();
      setCancelTimeLeft(left);
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedOrderId, ordersList]);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel order.');
        return;
      }
      
      setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      alert('Order cancelled successfully.');
    } catch {
      alert('Network error. Failed to cancel order.');
    }
  };

  const handleModifyOrder = async (order: ClientOrder) => {
    if (!confirm('Modifying this order will cancel the current order and add all items back to your cart. Do you want to proceed?')) return;
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch(`http://localhost:5000/api/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to cancel order for modification.');
        return;
      }
      
      setOrdersList(prev => prev.map(o => o.id === order.id ? { ...o, status: 'Cancelled' } : o));

      const allProductsFlattened: {
        id: string;
        name: string;
        price: string | number;
        unit: string;
        images?: string[];
        categoryTitle?: string;
        priceTiers?: { min: number; max: number; price: number; save: number }[];
      }[] = [];
      try {
        const prodRes = await fetch('http://localhost:5000/api/products');
        if (prodRes.ok) {
          const categories = await prodRes.json();
          categories.forEach((cat: { products?: typeof allProductsFlattened }) => {
            if (cat.products) {
              allProductsFlattened.push(...cat.products);
            }
          });
        }
      } catch (err) {
        console.warn('Failed to fetch products list for modify order matching:', err);
      }

      order.items.forEach(item => {
        const matchedProduct = allProductsFlattened.find(p => p.name.toLowerCase() === item.name.toLowerCase());
        if (matchedProduct) {
          addToCart(matchedProduct, item.qty);
        } else {
          const nameLower = item.name.toLowerCase();
          let unit = '/ Unit';
          let categoryTitle = 'Materials';
          if (nameLower.includes('cement')) {
            unit = '/ Bag';
            categoryTitle = 'Cement';
          } else if (nameLower.includes('pipe')) {
            unit = '/ Piece';
            categoryTitle = 'Plumbing';
          } else if (nameLower.includes('wire') || nameLower.includes('cable')) {
            unit = '/ Coil';
            categoryTitle = 'Electrical';
          } else if (nameLower.includes('rebar') || nameLower.includes('tmt') || nameLower.includes('sheet')) {
            unit = '/ Ton';
            categoryTitle = 'Steel';
          } else if (nameLower.includes('elbow') || nameLower.includes('tee') || nameLower.includes('mixer')) {
            unit = '/ Unit';
            categoryTitle = 'Plumbing';
          } else if (nameLower.includes('mcb') || nameLower.includes('switch')) {
            unit = '/ Unit';
            categoryTitle = 'Electrical';
          }

          const fallbackProduct = {
            id: nameLower.replace(/[^a-z0-9]+/g, '-'),
            name: item.name,
            price: item.price,
            unit,
            categoryTitle,
            images: [item.image || '/pdp_cpvc_pipe_main.png']
          };
          addToCart(fallbackProduct, item.qty);
        }
      });

      alert('Items have been added back to your cart. Redirecting to checkout...');
      window.location.hash = '#/checkout';
    } catch {
      alert('Network error. Failed to modify order.');
    }
  };
  const [servicesList, setServicesList] = useState<ServiceBooking[]>([]);
  const [rfqList, setRfqList] = useState<Rfq[]>([]);
  
  const [addresses, setAddresses] = useState<string[]>(() => {
    const saved = localStorage.getItem(`arcus-user-addresses-${user?.id}`);
    return saved ? JSON.parse(saved) : [
      'Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048',
      'Site B, 24th Main, HSR Layout, Sector 2, Bengaluru - 560102'
    ];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(`arcus-user-addresses-${user.id}`, JSON.stringify(addresses));
    }
  }, [addresses, user]);

  // ARCUS BuildPoints™ Loyalty & Rewards Program States
  const [challengesClaimed, setChallengesClaimed] = useState<string[]>([]);
  const [redeemedPoints, setRedeemedPoints] = useState(() => user ? Number(localStorage.getItem(`arcus-user-redeemed-points-${user.id}`) || 0) : 0);
  const [userCoupons, setUserCoupons] = useState<Coupon[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`arcus-user-coupons-${user.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [adminConfig, setAdminConfig] = useState({
    b2cBaseRate: 2, // 2 points per 500 spend
    b2bBaseRate: 3, // 3 points per 500 spend
    conversionRate: 0.5, // 1 point = 0.50 INR
    referralB2c: 500,
    referralB2b: 1000,
    referralPro: 500,
    pointsExpiryMonths: 12
  });

  interface SettingsFormState {
    name: string;
    phone: string;
    email: string;
    company: string;
    defaultAddress: string;
    city: string;
    state: string;
  }

  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(() => {
    if (!user) return {
      name: '',
      phone: '',
      email: '',
      company: '',
      defaultAddress: '',
      city: '',
      state: ''
    };
    const savedProfile = localStorage.getItem(`arcus-user-profile-data-${user.id}`);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        return {
          ...parsed,
          name: user.name || parsed.name || '',
          email: user.email || parsed.email || '',
          phone: user.phone || parsed.phone || '',
          city: user.city || parsed.city || 'Bengaluru',
          state: user.state || parsed.state || 'Karnataka',
          company: user.companyName || parsed.company || ''
        };
      } catch {
        // Fallback below
      }
    }
    return {
      name: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      company: user.companyName || '',
      defaultAddress: 'Flat 402, Block A, Prestige Shantiniketan, Whitefield, Bengaluru - 560048',
      city: user.city || 'Bengaluru',
      state: user.state || 'Karnataka'
    };
  });

  const [emailVerified, setEmailVerified] = useState(() => user ? (localStorage.getItem(`arcus-email-verified-${user.id}`) === 'true' || !!user.email) : true);
  const [settingsToast, setSettingsToast] = useState<string | null>(null);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpCountdown, setEmailOtpCountdown] = useState(0);
  const [simulatedEmailUrl, setSimulatedEmailUrl] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (emailOtpCountdown > 0) {
      timer = setInterval(() => {
        setEmailOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailOtpCountdown]);

  const handleSavePhone = async () => {
    if (!newPhone.trim()) {
      alert('Please enter a phone number first.');
      return;
    }
    if (newPhone.trim().length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/users/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: newPhone })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update phone number.');
        return;
      }

      setSettingsForm(prev => ({ ...prev, phone: newPhone }));
      await refreshUser();
      setIsEditingPhone(false);

      setSettingsToast('Phone number updated successfully!');
      setTimeout(() => setSettingsToast(null), 3000);
    } catch {
      alert('Network error. Please try again.');
    }
  };

  const handleRequestEmailOtp = async () => {
    if (!newEmail.trim()) {
      alert('Please enter an email address first.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/email-otp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send email verification OTP.');
        return;
      }
      setEmailOtpSent(true);
      setSimulatedEmailUrl(data.previewUrl || null);
      setEmailOtpCountdown(60);
    } catch {
      alert('Network error. Please try again.');
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp) {
      alert('Please enter the OTP verification code.');
      return;
    }
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newEmail, otp: emailOtp })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to verify email OTP.');
        return;
      }
      localStorage.setItem(`arcus-email-verified-${user?.id}`, 'true');
      setEmailVerified(true);
      setEmailOtpSent(false);
      setEmailOtp('');
      setIsEditingEmail(false);

      setSettingsForm(prev => ({ ...prev, email: newEmail }));
      await refreshUser();

      setSettingsToast('Email address updated and verified successfully!');
      setTimeout(() => setSettingsToast(null), 3000);
    } catch {
      alert('Network error. Please try again.');
    }
  };



  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('arcus_token');
      const res = await fetch('http://localhost:5000/api/users/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: settingsForm.name,
          companyName: settingsForm.company,
          city: settingsForm.city,
          state: settingsForm.state
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update profile changes.');
        return;
      }

      if (settingsForm.defaultAddress.trim()) {
        const updated = [...addresses];
        if (updated.length > 0) {
          updated[0] = settingsForm.defaultAddress.trim();
        } else {
          updated.push(settingsForm.defaultAddress.trim());
        }
        setAddresses(updated);
      }
      
      localStorage.setItem(`arcus-user-profile-data-${user?.id}`, JSON.stringify(settingsForm));

      await refreshUser();

      setSettingsToast('Profile settings saved successfully!');
      setTimeout(() => setSettingsToast(null), 3000);
    } catch {
      alert('Network error. Failed to save profile changes.');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('arcus_token');
        if (!token) return;
        const res = await fetch('http://localhost:5000/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrdersList(data);
        }
      } catch (err) {
        console.warn('Failed to fetch orders from server:', err);
      }
    };

    const fetchServices = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/service-bookings');
        if (res.ok) {
          const data = await res.json();
          if (user) {
            const filtered = data.filter((b: { phone?: string; name?: string }) => 
              b.phone === user.phone || 
              b.name?.toLowerCase() === user.name?.toLowerCase()
            );
            setServicesList(filtered);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch services:', err);
      }
    };

    const fetchRfqs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/rfqs');
        if (res.ok) {
          const data = await res.json();
          if (user) {
            const filtered = data.filter((r: { phone?: string; name?: string }) =>
              r.phone === user.phone ||
              r.name?.toLowerCase() === user.name?.toLowerCase()
            );
            setRfqList(filtered);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch RFQs:', err);
      }
    };

    fetchOrders();
    fetchServices();
    fetchRfqs();
  }, [user]);

  const mockServices = [
    {
      id: 'SRV-77192',
      serviceName: 'Bathroom Renovation & Leakage Proofing',
      provider: 'Vikas Plumbing Solutions',
      date: 'June 18, 2026',
      status: 'In Progress',
      amount: '₹12,500'
    },
    {
      id: 'SRV-77110',
      serviceName: 'Water Tank Installation',
      provider: 'Ramesh Kumar (Plumbing Pro)',
      date: 'June 12, 2026',
      status: 'Completed',
      amount: '₹3,200'
    }
  ];

  const downloadInvoice = (order: ClientOrder) => {
    const items = order.items || [];
    const grandTotalVal = parseAmount(order.amount);

    let totalTaxableValue = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    const tableRowsHtml = items.map(item => {
      const itemTotal = item.qty * item.price;
      const isCement = item.name.toLowerCase().includes('cement');
      const gstRate = isCement ? 28 : 18;
      const hsn = isCement ? '2523' : item.name.toLowerCase().includes('pipe') || item.name.toLowerCase().includes('elbow') || item.name.toLowerCase().includes('tee') ? '3917' : item.name.toLowerCase().includes('cable') || item.name.toLowerCase().includes('wire') ? '8544' : '8481';
      
      const taxableValue = itemTotal / (1 + gstRate / 100);
      const gstAmount = itemTotal - taxableValue;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      totalTaxableValue += taxableValue;
      totalCgst += cgst;
      totalSgst += sgst;

      return `
        <tr class="table-row-stripe" style="border-bottom: 1px solid #eee;">
          <td class="px-md py-lg" style="padding: 12px; font-size: 14px; text-align: left;">
            <p class="font-body-md font-bold text-on-surface" style="margin: 0; font-weight: bold; color: #1a1c1c;">${item.name}</p>
          </td>
          <td class="px-md py-lg font-body-sm" style="padding: 12px; font-size: 14px; text-align: left;">${hsn}</td>
          <td class="px-md py-lg font-body-sm" style="padding: 12px; font-size: 14px; text-align: left;">₹${(item.price / (1 + gstRate / 100)).toFixed(2)}</td>
          <td class="px-md py-lg font-body-sm" style="padding: 12px; font-size: 14px; text-align: left;">${item.qty}</td>
          <td class="px-md py-lg font-body-sm" style="padding: 12px; font-size: 14px; text-align: left;">0%</td>
          <td class="px-md py-lg font-body-sm" style="padding: 12px; font-size: 14px; text-align: left;">${gstRate}%</td>
          <td class="px-md py-lg font-body-md font-bold text-right" style="padding: 12px; font-size: 14px; text-align: right; font-weight: bold;">₹${itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const formattedGrandTotal = grandTotalVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedSubtotal = totalTaxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedCgst = totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const formattedSgst = totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const pmLower = (order.paymentMethod || '').toLowerCase();
    const isCOD = pmLower.includes('cash') || pmLower.includes('delivery') || pmLower.includes('cod');
    const isB2BCredit = pmLower.includes('credit');

    let paymentBadge = 'PAID';
    let paymentBadgeClass = 'bg-green-50 text-green-700 border-green-200';
    if (order.status === 'Cancelled') {
      paymentBadge = 'VOID / CANCELLED';
      paymentBadgeClass = 'bg-red-50 text-red-700 border-red-200';
    } else if (isCOD) {
      if (user && ['Business', 'Contractor', 'Supplier'].includes(user.role)) {
        paymentBadge = 'PARTIALLY PAID';
        paymentBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
      } else {
        paymentBadge = 'UNPAID';
        paymentBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
      }
    } else if (isB2BCredit) {
      paymentBadge = 'CREDIT DUE';
      paymentBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    }

    const htmlContent = `
<!DOCTYPE html>
<html class="light" lang="en">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>ARCUS Digital Procurement - Tax Invoice - ${order.id}</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Poppins:wght@700;800&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
  <script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "surface-container-high": "#e8e8e8",
            "secondary-fixed": "#e5e2e1",
            "on-surface": "#1a1c1c",
            "on-primary": "#ffffff",
            "inverse-primary": "#fabd00",
            "surface-variant": "#e2e2e2",
            "surface-bright": "#f9f9f9",
            "inverse-surface": "#2f3131",
            "tertiary-fixed": "#e5e2e1",
            "on-tertiary": "#ffffff",
            "surface-dim": "#dadada",
            "primary-container": "#ffc107",
            "on-background": "#1a1c1c",
            "on-secondary-container": "#656464",
            "error": "#ba1a1a",
            "on-secondary-fixed-variant": "#474646",
            "on-tertiary-container": "#565555",
            "on-error-container": "#93000a",
            "on-secondary-fixed": "#1c1b1b",
            "inverse-on-surface": "#f1f1f1",
            "on-primary-container": "#6d5100",
            "outline-variant": "#d4c5ab",
            "surface-container": "#eeeeee",
            "tertiary-fixed-dim": "#c8c6c5",
            "on-tertiary-fixed": "#1b1b1c",
            "on-error": "#ffffff",
            "primary-fixed-dim": "#fabd00",
            "error-container": "#ffdad6",
            "background": "#f9f9f9",
            "on-primary-fixed-variant": "#5b4300",
            "surface-tint": "#785900",
            "surface-container-highest": "#e2e2e2",
            "secondary": "#5f5e5e",
            "surface-container-lowest": "#ffffff",
            "secondary-container": "#e5e2e1",
            "on-surface-variant": "#4f4632",
            "secondary-fixed-dim": "#c8c6c5",
            "surface": "#f9f9f9",
            "primary": "#785900",
            "on-secondary": "#ffffff",
            "primary-fixed": "#ffdf9e",
            "tertiary-container": "#cdcaca",
            "on-primary-fixed": "#261a00",
            "tertiary": "#5f5e5e",
            "outline": "#827660",
            "on-tertiary-fixed-variant": "#474746",
            "surface-container-low": "#f3f3f3"
          },
          "borderRadius": {
            "DEFAULT": "0.25rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "full": "9999px"
          },
          "spacing": {
            "xs": "4px",
            "4xl": "64px",
            "sm": "8px",
            "md": "12px",
            "xxl": "32px",
            "xl": "24px",
            "5xl": "96px",
            "lg": "16px",
            "3xl": "48px"
          },
          "fontFamily": {
            "headline-h3": ["Poppins"],
            "headline-h1-mobile": ["Poppins"],
            "body-lg": ["Inter"],
            "body-md": ["Inter"],
            "headline-h1": ["Poppins"],
            "label-caps": ["Inter"],
            "body-sm": ["Inter"],
            "headline-h2": ["Poppins"]
          },
          "fontSize": {
            "headline-h3": ["32px", {"lineHeight": "120%", "fontWeight": "700"}],
            "headline-h1-mobile": ["40px", {"lineHeight": "110%", "fontWeight": "800"}],
            "body-lg": ["18px", {"lineHeight": "160%", "fontWeight": "400"}],
            "body-md": ["16px", {"lineHeight": "150%", "fontWeight": "400"}],
            "headline-h1": ["64px", {"lineHeight": "110%", "letterSpacing": "-0.02em", "fontWeight": "800"}],
            "label-caps": ["12px", {"lineHeight": "100%", "letterSpacing": "0.05em", "fontWeight": "600"}],
            "body-sm": ["14px", {"lineHeight": "140%", "fontWeight": "500"}],
            "headline-h2": ["48px", {"lineHeight": "120%", "fontWeight": "700"}]
          }
        },
      },
    }
  </script>
  <style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    @media print {
      .no-print { display: none; }
      body { background-color: white; }
      .invoice-shell { box-shadow: none; border: none; margin: 0; padding: 0; }
    }
    .table-row-stripe:nth-child(even) {
      background-color: #f9f9f9;
    }
    .industrial-border {
      border-left: 4px solid #1a1c1c;
    }
  </style>
</head>
<body class="bg-surface text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container p-xl flex justify-center items-start min-h-screen">
  <!-- Top Bar Navigation -->
  <header class="no-print fixed top-0 left-0 right-0 z-50 bg-surface shadow-sm border-b border-outline-variant flex justify-between items-center px-xxl py-md">
    <div class="flex items-center gap-xl">
      <span class="font-headline-h3 text-headline-h3 font-extrabold text-on-surface">ARCUS</span>
      <nav class="hidden md:flex gap-lg">
        <a class="text-secondary hover:text-on-surface transition-colors font-body-md" href="#">Marketplace</a>
        <a class="text-secondary hover:text-on-surface transition-colors font-body-md" href="#">Contractors</a>
        <a class="text-secondary hover:text-on-surface transition-colors font-body-md" href="#">Projects</a>
        <a class="text-primary border-b-2 border-primary font-bold pb-1 font-body-md" href="#">Invoices</a>
      </nav>
    </div>
    <div class="flex items-center gap-md">
      <button onclick="window.print()" class="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-xs">
        <span class="material-symbols-outlined">download</span>
        Download PDF
      </button>
    </div>
  </header>

  <!-- Main Invoice Container -->
  <main class="invoice-shell w-full max-w-[1000px] bg-white shadow-xl mt-xxl mb-5xl p-xxl industrial-border relative text-left">
    <!-- Header Section -->
    <section class="flex justify-between items-start mb-4xl">
      <div class="flex flex-col gap-md">
        <span class="font-headline-h3 text-headline-h3 font-extrabold text-on-surface tracking-tighter">ARCUS<span class="text-[#FFC107]">.</span></span>
        <div class="mt-md">
          <p class="font-label-caps text-label-caps text-secondary-fixed-dim">ARCUS PROCUREMENT SOLUTIONS</p>
          <p class="font-body-sm text-body-sm text-secondary">112 Industrial Hub, Sector 62, Gurgaon, IN</p>
          <p class="font-body-sm text-body-sm text-secondary">GSTIN: 07AABCU1234F1Z5</p>
        </div>
      </div>
      <div class="text-right">
        <h1 class="font-headline-h2 text-headline-h2 text-on-surface tracking-tighter mb-sm">TAX INVOICE</h1>
        <div class="flex flex-col gap-xs">
          <div class="flex justify-end gap-xl">
            <span class="font-label-caps text-label-caps text-secondary">INVOICE NO:</span>
            <span class="font-body-md text-body-md font-bold">INV-${order.id}</span>
          </div>
          <div class="flex justify-end gap-xl">
            <span class="font-label-caps text-label-caps text-secondary">DATE:</span>
            <span class="font-body-md text-body-md">${order.date || 'N/A'}</span>
          </div>
          <div class="flex justify-end gap-xl">
            <span class="font-label-caps text-label-caps text-secondary">ORDER ID:</span>
            <span class="font-body-md text-body-md font-bold">${order.id}</span>
          </div>
          <div class="flex justify-end mt-md">
            <span class="font-bold px-lg py-xs rounded-full border text-sm ${paymentBadgeClass}">${paymentBadge}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Billing/Shipping Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4xl mb-4xl">
      <div class="p-lg bg-surface-container-low rounded-lg border border-outline-variant">
        <h3 class="font-label-caps text-label-caps text-primary border-b border-outline-variant pb-sm mb-md flex items-center gap-xs">
          <span class="material-symbols-outlined text-sm">person</span>
          BILL TO
        </h3>
        <p class="font-body-lg text-body-lg font-bold text-on-surface mb-xs">${user?.name || 'Valued Customer'}</p>
        <p class="font-body-sm text-body-sm text-secondary">Phone: ${user?.phone || 'N/A'}</p>
        <p class="font-body-sm text-body-sm text-secondary">Email: ${user?.email || 'N/A'}</p>
        ${order.gstNumber ? `<p class="font-body-sm text-body-sm font-bold mt-md">GSTIN: ${order.gstNumber}</p>` : ''}
      </div>
      <div class="p-lg bg-white rounded-lg border border-outline-variant shadow-sm">
        <h3 class="font-label-caps text-label-caps text-secondary border-b border-outline-variant pb-sm mb-md flex items-center gap-xs">
          <span class="material-symbols-outlined text-sm">local_shipping</span>
          SHIP TO
        </h3>
        <p class="font-body-sm text-body-sm text-secondary leading-relaxed">${order.shippingAddress || 'N/A'}</p>
        <p class="font-body-sm text-body-sm font-bold mt-md">Billing Address:</p>
        <p class="text-secondary text-xs leading-relaxed">${order.billingAddress || 'N/A'}</p>
      </div>
    </section>

    <!-- Itemized Table -->
    <section class="mb-4xl overflow-hidden border border-on-surface rounded-lg">
      <table class="w-full text-left border-collapse" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr class="bg-inverse-surface text-white" style="background-color: #2f3131; color: white;">
            <th class="px-md py-lg font-label-caps text-label-caps" style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Item Description</th>
            <th class="px-md py-lg font-label-caps text-label-caps" style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">HSN</th>
            <th class="px-md py-lg font-label-caps text-label-caps" style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Price (Excl. Tax)</th>
            <th class="px-md py-lg font-label-caps text-label-caps" style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Qty</th>
            <th class="px-md py-lg font-label-caps text-label-caps" style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">Disc%</th>
            <th class="px-md py-lg font-label-caps text-label-caps" style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">GST%</th>
            <th class="px-md py-lg font-label-caps text-label-caps text-right" style="padding: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-outline-variant">
          ${tableRowsHtml}
        </tbody>
      </table>
    </section>

    <!-- Totals & Banking Section -->
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4xl mb-4xl">
      <!-- Left: Bank Details -->
      <div class="flex flex-col gap-lg">
        <div class="p-lg border border-outline-variant rounded-lg">
          <h4 class="font-label-caps text-label-caps font-bold mb-md text-on-surface">BANK TRANSFER DETAILS</h4>
          <div class="flex flex-col gap-xs font-body-sm text-body-sm">
            <div class="flex justify-between border-b border-surface-container-high py-xs">
              <span class="text-secondary">Beneficiary Name</span>
              <span class="font-bold">ARCUS SERVICES PVT LTD</span>
            </div>
            <div class="flex justify-between border-b border-surface-container-high py-xs">
              <span class="text-secondary">Account Number</span>
              <span class="font-bold">50200045612398</span>
            </div>
            <div class="flex justify-between border-b border-surface-container-high py-xs">
              <span class="text-secondary">IFSC Code</span>
              <span class="font-bold">HDFC0001245</span>
            </div>
            <div class="flex justify-between py-xs">
              <span class="text-secondary">Bank Name</span>
              <span class="font-bold">HDFC Bank, Gurgaon Br.</span>
            </div>
          </div>
        </div>
        <div class="text-secondary italic text-xs leading-relaxed">
          <p>Notes: Please include Invoice #INV-${order.id} in the payment reference. Subject to Gurgaon jurisdiction.</p>
        </div>
      </div>

      <!-- Right: Calculation Breakdown -->
      <div class="flex flex-col bg-surface-container-low p-xl rounded-lg">
        <div class="flex justify-between items-center mb-md">
          <span class="font-body-md text-secondary">Subtotal (Taxable)</span>
          <span class="font-body-md font-bold">₹${formattedSubtotal}</span>
        </div>
        <div class="flex justify-between items-center mb-md">
          <span class="font-body-md text-secondary">SGST</span>
          <span class="font-body-md font-bold">₹${formattedSgst}</span>
        </div>
        <div class="flex justify-between items-center mb-md">
          <span class="font-body-md text-secondary">CGST</span>
          <span class="font-body-md font-bold">₹${formattedCgst}</span>
        </div>
        <div class="flex justify-between items-center pt-lg border-t-2 border-outline-variant mb-xl">
          <span class="font-headline-h3 text-headline-h3 text-on-surface">TOTAL</span>
          <span class="font-headline-h3 text-headline-h3 text-on-primary-container bg-primary-container px-lg py-xs rounded">₹${formattedGrandTotal}</span>
        </div>
      </div>
    </section>

    <!-- Terms & Seal Footer -->
    <footer class="border-t border-outline-variant pt-3xl flex flex-col md:flex-row justify-between items-end gap-xxl">
      <div class="max-w-md">
        <h5 class="font-label-caps text-label-caps font-bold mb-sm" style="font-weight: bold; margin-bottom: 8px;">TERMS &amp; CONDITIONS</h5>
        <ul class="text-[11px] text-secondary space-y-1 list-disc pl-md text-left" style="font-size: 11px; color: #5f5e5e; margin: 0; padding-left: 16px; list-style-type: disc;">
          <li>Goods once sold will not be taken back or exchanged.</li>
          <li>Interest @18% p.a. will be charged if payment is not made within 30 days.</li>
          <li>Our responsibility ceases as soon as goods leave our premises.</li>
          <li>Any discrepancy should be reported within 24 hours of delivery.</li>
        </ul>
      </div>
      <div class="text-center flex flex-col items-center">
        <div class="relative mb-md">
          <div class="border-2 border-primary-container rounded-lg p-md text-center bg-white shadow-sm relative z-10">
            <span class="material-symbols-outlined text-primary-container text-4xl block" style="font-variation-settings: 'FILL' 1; font-size: 36px; color: #ffc107;">verified_user</span>
            <p class="font-label-caps text-[10px] text-on-surface-variant font-bold uppercase mt-xs tracking-widest" style="font-size: 10px; font-weight: bold; text-transform: uppercase;">Digitally Signed</p>
            <p class="font-body-sm text-[10px] text-secondary" style="font-size: 10px; color: #5f5e5e;">By: ARCUS AUTH SERVER</p>
            <p class="font-body-sm text-[10px] text-secondary" style="font-size: 10px; color: #5f5e5e;">Timestamp: ${order.timestamp || new Date().toISOString()}</p>
          </div>
        </div>
        <p class="font-body-sm text-body-sm text-on-surface font-bold" style="font-weight: bold; margin-top: 4px;">Authorized Signatory</p>
      </div>
    </footer>
  </main>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      alert('Please allow popups to download/print the invoice.');
    }
  };

  const handleReorder = (itemName: string, itemQty: number) => {
    const isCPVC = itemName.includes('CPVC');
    const isElbow = itemName.includes('Elbow');
    const isCement = itemName.includes('Cement');
    const isMixer = itemName.includes('Mixer');

    const itemPrice = isCPVC ? 165 : isElbow ? 24 : isCement ? 430 : isMixer ? 3450 : 100;
    const itemUnit = isCement ? '/ Bag' : isElbow ? '/ Unit' : isCPVC ? '/ Piece' : '/ Unit';
    const itemImage = isCPVC 
      ? '/pdp_cpvc_pipe_main.png' 
      : isElbow 
        ? '/pdp_cpvc_elbow.png' 
        : isCement 
          ? '/pdp_ultratech_cement.png' 
          : '/pdp_jaquar_basin_mixer.png';

    addToCart({
      id: itemName.toLowerCase().replace(/\s+/g, '-'),
      name: itemName,
      price: itemPrice,
      unit: itemUnit,
      images: [itemImage],
      categoryTitle: isCPVC || isElbow || isMixer ? 'Plumbing' : isCement ? 'Cement' : 'Materials'
    }, itemQty);
    
    setRepeatToast(`Added ${itemQty} x ${itemName} to cart!`);
    setTimeout(() => {
      setRepeatToast(null);
    }, 3000);
  };

  const finalServices = servicesList.length > 0 ? servicesList.map((s, idx) => ({
    id: s.id || `SRV-${10000 + idx}`,
    serviceName: s.serviceName,
    provider: 'Arcus Verified Partner',
    date: s.date || 'TBD',
    status: 'In Progress',
    amount: '₹2,500'
  })) : mockServices;

  const finalOrders = ordersList;

  const filteredOrders = finalOrders.filter((order) => {
    const matchesStatus = orderStatusFilter === 'All' || order.status === orderStatusFilter;
    const cleanSearch = sanitizeText(orderSearch);
    const matchesSearch = 
      order.id.toLowerCase().includes(cleanSearch.toLowerCase()) ||
      (order.products || '').toLowerCase().includes(cleanSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredServices = finalServices.filter((service) => {
    const matchesStatus = serviceStatusFilter === 'All' || service.status === serviceStatusFilter;
    const cleanSearch = sanitizeText(serviceSearch);
    const matchesSearch = 
      service.id.toLowerCase().includes(cleanSearch.toLowerCase()) ||
      service.serviceName.toLowerCase().includes(cleanSearch.toLowerCase()) ||
      service.provider.toLowerCase().includes(cleanSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate dynamic card metrics
  const getOrdersSubtitle = () => {
    const awaiting = finalOrders.filter(o => o.status === 'Awaiting Delivery' || o.status === 'Pending').length;
    const outForDelivery = finalOrders.filter(o => o.status === 'Out For Delivery' || o.status === 'Out For Site Delivery').length;
    const delivered = finalOrders.filter(o => o.status === 'Delivered').length;
    
    const parts = [];
    if (awaiting > 0) parts.push(`${awaiting} ${awaiting === 1 ? 'order' : 'orders'} Awaiting Delivery`);
    if (outForDelivery > 0) parts.push(`${outForDelivery} ${outForDelivery === 1 ? 'order' : 'orders'} Out for Delivery`);
    if (parts.length === 0) {
      if (delivered > 0) {
        parts.push(`${delivered} ${delivered === 1 ? 'order' : 'orders'} Delivered`);
      } else {
        parts.push('0 Active Orders');
      }
    }
    return parts.join(', ');
  };

  const getServicesSubtitle = () => {
    const pending = finalServices.filter(s => s.status === 'In Progress' || s.status === 'Pending').length;
    const completed = finalOrders.filter(o => o.status === 'Delivered').length;
    
    if (pending > 0) {
      return `${pending} Pending Service${pending === 1 ? '' : 's'} • ${completed} Completed Order${completed === 1 ? '' : 's'}`;
    } else {
      return `${completed} Completed Order${completed === 1 ? '' : 's'}`;
    }
  };

  const renderOrderDetail = () => {
    const orderId = selectedOrderId;
    if (!orderId) return null;

    const order = ordersList.find(o => o.id === orderId);
    if (!order) {
      return (
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-xl text-center space-y-md shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-red-500">error</span>
          <h3 className="font-bold text-[#0A0A0A] text-md">Order Not Found</h3>
          <p className="text-secondary text-xs">The requested order ID does not exist in your history.</p>
          <button
            onClick={goBackToOrders}
            className="px-md py-2 bg-[#FFC107] text-[#0A0A0A] font-bold rounded-lg text-xs"
          >
            Back to Orders
          </button>
        </div>
      );
    }

    const steps = [
      { id: 'Pending', label: 'Order Placed', desc: 'Received & Confirmed' },
      { id: 'Awaiting Delivery', label: 'Processing', desc: 'Packed at Warehouse' },
      { id: 'Out For Delivery', label: 'Out For Delivery', desc: 'En Route to Site' },
      { id: 'Delivered', label: 'Delivered', desc: 'Handed over at Site' }
    ];

    const currentStatusIndex = steps.findIndex(s => s.id === order.status);
    const activeIndex = currentStatusIndex !== -1 ? currentStatusIndex : 0;



    const items = order.items || [];
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const grandTotalVal = parseAmount(order.amount);
    const shippingFee = calculatedSubtotal >= 5000 ? 0 : 350;

    const netTotalForGst = grandTotalVal - shippingFee;
    const computedDiscountedSubtotal = (grandTotalVal > 0 && netTotalForGst > 0)
      ? Math.round(netTotalForGst / 1.18)
      : calculatedSubtotal;

    const calculatedGst = (grandTotalVal > 0 && netTotalForGst > 0)
      ? (netTotalForGst - computedDiscountedSubtotal)
      : Math.round(calculatedSubtotal * 0.18);

    const discountVal = Math.max(0, calculatedSubtotal - computedDiscountedSubtotal);

    const paymentMethod = order.paymentMethod || 'Credit / Debit Card';
    const pmLower = paymentMethod.toLowerCase();
    const isCOD = pmLower.includes('cash') || pmLower.includes('delivery') || pmLower.includes('cod');
    const isB2BCredit = pmLower.includes('credit');
    const isPrepaid = !isCOD && !isB2BCredit;

    const isB2B = user && ['Business', 'Contractor', 'Supplier'].includes(user.role);

    let paymentStatus = 'Paid';
    let paidPct = 100;
    let duePct = 0;

    if (isPrepaid) {
      paymentStatus = 'Paid';
      paidPct = 100;
      duePct = 0;
    } else if (isCOD) {
      if (isB2B) {
        paymentStatus = 'Partially Paid (10% Advance)';
        paidPct = 10;
        duePct = 90;
      } else {
        paymentStatus = 'Pending (Pay on Delivery)';
        paidPct = 0;
        duePct = 100;
      }
    } else if (isB2BCredit) {
      paymentStatus = 'Pending (B2B Credit Terms)';
      paidPct = 0;
      duePct = 100;
    }

    if (order.status === 'Cancelled') {
      paymentStatus = 'Refunded / Void';
      paidPct = 0;
      duePct = 0;
    }

    const numericAmount = parseAmount(order.amount);
    const amountPaid = Math.round(numericAmount * (paidPct / 100));
    const amountDue = Math.round(numericAmount * (duePct / 100));

    return (
      <div className="space-y-lg text-left">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-md pb-sm border-b border-[#E9ECEF]">
          <div className="flex items-center gap-sm">
            <button
              onClick={goBackToOrders}
              className="p-sm bg-white border border-[#E9ECEF] text-secondary hover:text-[#0A0A0A] rounded-xl transition-colors flex items-center justify-center shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-sm">
                <h3 className="font-bold text-[#0A0A0A] text-lg">Order {order.id}</h3>
                <span className={`inline-block px-sm py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                  order.status === 'Delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'Out For Delivery'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'Awaiting Delivery'
                    ? 'bg-amber-100 text-amber-800'
                    : order.status === 'Cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-secondary text-xs mt-0.5">Placed on {order.date}</p>
            </div>
          </div>
          <button
            onClick={() => downloadInvoice(order)}
            className="px-md py-2 bg-white border border-[#E9ECEF] hover:bg-[#FFC107] hover:border-[#FFC107] hover:text-[#0A0A0A] text-secondary font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-xs shadow-sm self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Download Invoice
          </button>
        </div>

        {/* Cancel/Modify Order Actions Banner */}
        {cancelTimeLeft > 0 && order.status !== 'Cancelled' && (
          <div className="bg-[#FFFDF5] border border-[#FFC107]/20 p-md rounded-2xl flex flex-col md:flex-row justify-between items-center gap-md shadow-sm">
            <div className="flex items-center gap-md text-left">
              <span className="material-symbols-outlined text-[#FFC107] text-[28px] animate-pulse">timer</span>
              <div>
                <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-[#FFC107]">Order Modification Window Active</h4>
                <p className="text-secondary text-xs mt-0.5">
                  You can cancel or modify this prepaid order within <strong className="text-[#0A0A0A] font-bold font-mono">{formatTimeLeft(cancelTimeLeft)}</strong>.
                </p>
              </div>
            </div>
            <div className="flex gap-sm shrink-0">
              <button
                onClick={() => handleCancelOrder(order.id)}
                className="px-md py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold rounded-lg text-xs transition-colors"
              >
                Cancel Order
              </button>
              <button
                onClick={() => handleModifyOrder(order)}
                className="px-md py-1.5 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-lg text-xs transition-colors shadow-sm"
              >
                Modify Order
              </button>
            </div>
          </div>
        )}

        {/* Stepper Card / Cancelled Banner */}
        {order.status === 'Cancelled' ? (
          <div className="bg-red-50 border border-red-200 p-lg rounded-2xl flex items-center gap-md text-left shadow-sm">
            <span className="material-symbols-outlined text-red-500 text-[32px]">cancel</span>
            <div>
              <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-red-700 font-bold">Order Cancelled</h4>
              <p className="text-secondary text-xs mt-0.5">
                This order has been cancelled and a full refund has been initiated to your original payment method.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E9ECEF] p-lg rounded-2xl shadow-sm text-left space-y-md">
            <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-secondary">Delivery Progress Tracker</h4>
            
            <div className="relative pt-md pb-sm">
              <div className="hidden md:block absolute top-[44px] left-[5%] right-[5%] h-1 bg-[#E9ECEF] -translate-y-1/2 -z-10">
                <div 
                  className="bg-green-600 h-full transition-all duration-500" 
                  style={{ width: `${(activeIndex / (steps.length - 1)) * 90}%`, marginLeft: '5%' }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-lg md:gap-sm relative">
                {steps.map((step, idx) => {
                  const isCompleted = idx < activeIndex;
                  const isActive = idx === activeIndex;

                  let iconName = 'schedule';
                  if (step.id === 'Pending') iconName = 'shopping_bag';
                  else if (step.id === 'Awaiting Delivery') iconName = 'inventory_2';
                  else if (step.id === 'Out For Delivery') iconName = 'local_shipping';
                  else if (step.id === 'Delivered') iconName = 'check_circle';

                  return (
                    <div key={step.id} className="flex md:flex-col items-center md:text-center gap-md md:gap-sm">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          isCompleted 
                            ? 'bg-green-600 text-white' 
                            : isActive 
                            ? 'bg-[#FFC107] text-[#0A0A0A] ring-4 ring-[#FFC107]/20 animate-pulse' 
                            : 'bg-[#F8F9FA] text-secondary border border-[#E9ECEF]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px]">
                          {isCompleted ? 'check' : iconName}
                        </span>
                      </div>

                      <div className="text-left md:text-center space-y-xs">
                        <p className={`font-bold text-xs ${isActive ? 'text-[#0A0A0A]' : 'text-secondary'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-secondary leading-normal">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="bg-white border border-[#E9ECEF] p-lg rounded-2xl shadow-sm text-left space-y-md flex flex-col justify-between">
            <div>
              <div className="border-b border-[#E9ECEF] pb-sm">
                <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-secondary">Customer &amp; Procurement Details</h4>
              </div>
              <div className="space-y-sm mt-md text-xs">
                <p><span className="font-bold text-secondary">Contact Name:</span> {user?.name || 'Valued Customer'}</p>
                <p><span className="font-bold text-secondary">Email:</span> {user?.email}</p>
                <p><span className="font-bold text-secondary">Phone Number:</span> {user?.phone || 'N/A'}</p>
                {order.gstNumber && (
                  <p><span className="font-bold text-secondary">GSTIN:</span> <span className="uppercase font-mono font-bold text-primary">{order.gstNumber}</span></p>
                )}
                {user?.companyName && (
                  <p><span className="font-bold text-secondary">Company Name:</span> {user.companyName}</p>
                )}
              </div>
            </div>
            
            <div className="pt-md border-t border-[#E9ECEF] text-xs">
              <p><span className="font-bold text-secondary">Payment Method:</span> {paymentMethod}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E9ECEF] p-lg rounded-2xl shadow-sm text-left space-y-md">
            <div className="border-b border-[#E9ECEF] pb-sm">
              <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-secondary">Delivery Addresses</h4>
            </div>
            <div className="grid grid-cols-1 gap-md pt-sm text-xs">
              <div>
                <p className="font-bold text-[#0A0A0A] font-label-caps uppercase tracking-wider text-[10px] text-primary">Shipping Address</p>
                <p className="text-secondary leading-relaxed mt-xs font-semibold">{order.shippingAddress}</p>
              </div>
              <div>
                <p className="font-bold text-[#0A0A0A] font-label-caps uppercase tracking-wider text-[10px] text-primary">Billing Address</p>
                <p className="text-secondary leading-relaxed mt-xs font-semibold">{order.billingAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary & Dues Tracking */}
        <div className="bg-white border border-[#E9ECEF] p-lg rounded-2xl shadow-sm text-left space-y-md">
          <div className="border-b border-[#E9ECEF] pb-sm">
            <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-secondary">Payment Summary &amp; Dues Tracking</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md pt-sm text-xs">
            <div>
              <p className="font-bold text-secondary">Payment Method</p>
              <p className="text-[#0A0A0A] font-semibold mt-xs text-sm">{paymentMethod}</p>
            </div>
            <div>
              <p className="font-bold text-secondary">Payment Status</p>
              <p className="mt-xs">
                <span className={`inline-block px-sm py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                  paymentStatus.includes('Paid') && !paymentStatus.includes('Partially')
                    ? 'bg-green-100 text-green-800'
                    : paymentStatus.includes('Partially')
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {paymentStatus}
                </span>
              </p>
            </div>
            <div>
              <p className="font-bold text-secondary">Dues Breakdown</p>
              <div className="space-y-xs mt-xs text-[11px]">
                <div className="flex justify-between">
                  <span className="text-secondary">Amount Paid ({paidPct}%):</span>
                  <span className="font-bold text-green-700">₹{amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-[#E9ECEF] pt-xs">
                  <span className="text-secondary">Outstanding Due ({duePct}%):</span>
                  <span className="font-bold text-red-600">₹{amountDue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Materials Card */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl overflow-hidden shadow-sm">
          <div className="p-lg border-b border-[#E9ECEF] text-left">
            <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-secondary">Procured Materials Summary</h4>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[10px] font-bold text-secondary uppercase tracking-wider">
                <th className="p-md">Material Description</th>
                <th className="p-md text-center">Quantity</th>
                <th className="p-md text-right">Unit Price</th>
                <th className="p-md text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF] text-xs">
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-[#F8F9FA]/30 transition-colors">
                  <td className="p-md font-semibold text-[#0A0A0A] flex items-center gap-md">
                    {item.image && (
                      <div className="w-10 h-10 rounded-lg border border-[#E9ECEF] overflow-hidden bg-white shrink-0 flex items-center justify-center">
                        <img src={item.image} className="object-cover w-full h-full" alt={item.name} />
                      </div>
                    )}
                    <span>{item.name}</span>
                  </td>
                  <td className="p-md text-center text-[#0A0A0A] font-bold">{item.qty}</td>
                  <td className="p-md text-right text-secondary font-medium">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="p-md text-right text-[#0A0A0A] font-bold">₹{(item.qty * item.price).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-[#F8F9FA] p-lg border-t border-[#E9ECEF] flex justify-end">
            <div className="w-80 space-y-sm text-xs">
              <div className="flex justify-between items-center text-secondary">
                <span>Subtotal</span>
                <span className="font-semibold">₹{calculatedSubtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountVal > 0 && (
                <div className="flex justify-between items-center text-green-700 font-semibold">
                  <span>Discount</span>
                  <span>-₹{discountVal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-secondary">
                <span>GST (18%)</span>
                <span className="font-semibold">₹{calculatedGst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-secondary">
                <span>Shipping Fee</span>
                <span className="font-semibold">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-[#0A0A0A] border-t border-[#E9ECEF] pt-sm">
                <span>Grand Total</span>
                <span>{order.amount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="bg-white border border-[#E9ECEF] p-lg rounded-2xl shadow-sm text-left space-y-sm">
            <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-secondary flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-[#FFC107]">gavel</span>
              Procurement Terms
            </h4>
            <p className="text-secondary text-[11px] leading-relaxed">
              All bulk purchases are subject to the standard Arcus Construction Commerce contract policies.
              Materials must be properly stored at the delivery site to maintain quality and warranty coverage.
              Return requests must be submitted within 7 business days of delivery.
            </p>
          </div>
          <div className="bg-white border border-[#E9ECEF] p-lg rounded-2xl shadow-sm text-left space-y-sm">
            <h4 className="font-bold text-xs uppercase font-label-caps tracking-wider text-secondary flex items-center gap-xs">
              <span className="material-symbols-outlined text-[16px] text-[#FFC107]">autorenew</span>
              Return &amp; Refund Conditions
            </h4>
            <p className="text-secondary text-[11px] leading-relaxed">
              <strong>Pipes &amp; Hardware Fittings:</strong> Eligible for 100% refund if unused and in original packaging.
              <br />
              <strong>Bulk Materials (Cement, Steel, Custom Paints):</strong> Subject to a 15% restocking fee due to shelf life.
              Purchaser bears return logistics costs unless a dispatch error is verified.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => {
    const awaiting = finalOrders.filter(o => o.status === 'Awaiting Delivery' || o.status === 'Pending').length;
    
    return (
      <div className="space-y-xl">
        {/* Welcome Card */}
        <div className="bg-[#1a1c1c] text-white p-xl rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[140px] shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-primary/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <h2 className="text-xl md:text-2xl font-bold">Welcome back, {user?.name}!</h2>
          <p className="text-gray-400 text-xs mt-xs max-w-xl">Monitor your procurement orders, manage your custom site quotes, and coordinate deliveries with ease.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div 
            onClick={() => setActiveTab('orders')}
            className="bg-white border border-[#E9ECEF] p-md rounded-2xl cursor-pointer hover:border-primary transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">shopping_bag</span>
            <p className="text-[20px] font-bold text-[#0A0A0A] mt-2">{finalOrders.length} Orders</p>
            <p className="text-[10px] text-secondary font-bold font-label-caps uppercase tracking-wide mt-1">
              {awaiting > 0 ? `${awaiting} Awaiting delivery` : 'No pending deliveries'}
            </p>
          </div>
          <div 
            onClick={() => setActiveTab('services')}
            className="bg-white border border-[#E9ECEF] p-md rounded-2xl cursor-pointer hover:border-primary transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">handshake</span>
            <p className="text-[20px] font-bold text-[#0A0A0A] mt-2">{finalServices.length} Services</p>
            <p className="text-[10px] text-secondary font-bold font-label-caps uppercase tracking-wide mt-1">
              Hired professionals list
            </p>
          </div>
          <div 
            onClick={() => setActiveTab('rfqs')}
            className="bg-white border border-[#E9ECEF] p-md rounded-2xl cursor-pointer hover:border-primary transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[#FFC107] text-[32px]">receipt_long</span>
            <p className="text-[20px] font-bold text-[#0A0A0A] mt-2">{rfqList.length} RFQ Requests</p>
            <p className="text-[10px] text-secondary font-bold font-label-caps uppercase tracking-wide mt-1">
              Submitted estimates
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg text-left shadow-sm space-y-md">
          <h3 className="font-bold text-[#0A0A0A] text-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">schedule</span>
            Recent Activities
          </h3>
          <div className="space-y-sm">
            {finalOrders.slice(0, 2).map((order) => (
              <div key={order.id} className="flex gap-md p-md bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF]">
                <span className="material-symbols-outlined text-[#FFC107] text-[24px]">local_shipping</span>
                <div className="space-y-xs text-xs">
                  <p className="font-bold text-[#0A0A0A]">
                    Order{" "}
                    <button
                      onClick={() => viewOrderDetail(order.id)}
                      className="text-[#FFC107] hover:underline font-bold inline-block"
                    >
                      {order.id}
                    </button>{" "}
                    status update
                  </p>
                  <p className="text-secondary">Your order with materials is currently <span className="font-bold text-primary">{order.status}</span>.</p>
                  <p className="text-[10px] text-secondary">{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRfqs = () => {
    const mockRfqs = [
      {
        id: 'RFQ-8812',
        date: 'June 18, 2026',
        category: 'Plumbing CPVC pipes',
        quantity: '3 items (350 units)',
        location: 'Indiranagar, Bengaluru',
        timeline: 'Immediate (1-3 Days)',
        status: 'Quotes Received'
      },
      {
        id: 'RFQ-8791',
        date: 'June 14, 2026',
        category: 'Building Bricks & Blocks',
        quantity: '5,000 blocks',
        location: 'Whitefield, Bengaluru',
        timeline: '1 Week',
        status: 'Processed'
      }
    ];

    const finalRfqs = rfqList.length > 0 ? rfqList.map(r => ({
      id: r.id || `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: r.timestamp ? new Date(r.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'June 18, 2026',
      category: r.category || 'Quick Order Pad',
      quantity: r.quantity || 'Multiple items',
      location: r.location || 'Bengaluru',
      timeline: r.timeline || 'Immediate',
      status: 'Pending Quotes'
    })) : mockRfqs;

    return (
      <div className="space-y-md">
        <div className="bg-white border border-[#E9ECEF] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[10px] font-bold text-secondary uppercase tracking-wider">
                <th className="p-md">RFQ Info</th>
                <th className="p-md">Materials / Category</th>
                <th className="p-md">Location</th>
                <th className="p-md">Timeline</th>
                <th className="p-md text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF] text-xs">
              {finalRfqs.map((rfq) => (
                <tr key={rfq.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="p-md font-semibold text-[#0A0A0A]">
                    <div className="font-bold text-sm">{rfq.id}</div>
                    <div className="text-secondary text-[11px] font-normal">{rfq.date}</div>
                  </td>
                  <td className="p-md text-secondary">
                    <div className="font-bold text-[#0A0A0A]">{rfq.category}</div>
                    <div>Qty: {rfq.quantity}</div>
                  </td>
                  <td className="p-md text-secondary font-medium">{rfq.location}</td>
                  <td className="p-md text-secondary">{rfq.timeline}</td>
                  <td className="p-md text-right">
                    <span className={`inline-block px-sm py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                      rfq.status === 'Quotes Received'
                        ? 'bg-green-100 text-green-800'
                        : rfq.status === 'Processed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rfq.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSaved = () => {
    const savedItems = [
      {
        id: 'astral-cpvc-pipe',
        name: 'Astral CPVC Pipe (1 Inch, SDR 11)',
        price: 165,
        unit: 'Piece',
        image: '/pdp_cpvc_pipe_main.png'
      },
      {
        id: 'supreme-elbow',
        name: 'Supreme Elbow 90° (1 Inch)',
        price: 24,
        unit: 'Unit',
        image: '/pdp_cpvc_elbow.png'
      },
      {
        id: 'ultratech-cement',
        name: 'Ultratech Cement (50kg Bag)',
        price: 430,
        unit: 'Bag',
        image: '/pdp_ultratech_cement.png'
      }
    ];

    const handleAddSavedToCart = (item: { id: string; name: string; price: number; unit: string; image: string }) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        unit: '/' + item.unit,
        images: [item.image],
        categoryTitle: 'Materials'
      }, 50);
      setRepeatToast(`Added 50 units of ${item.name} to cart!`);
      setTimeout(() => setRepeatToast(null), 3000);
    };

    return (
      <div className="space-y-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {savedItems.map((item) => (
            <div key={item.id} className="bg-white border border-[#E9ECEF] rounded-2xl p-md flex flex-col justify-between text-left hover:shadow-md transition-all shadow-sm">
              <div className="aspect-square bg-white border border-[#E9ECEF] rounded-xl overflow-hidden mb-sm flex items-center justify-center">
                <img src={item.image} className="object-cover w-full h-full" alt={item.name} />
              </div>
              <div className="space-y-xs">
                <h4 className="font-bold text-xs text-[#0A0A0A] line-clamp-2 min-h-[32px]">{item.name}</h4>
                <p className="font-extrabold text-sm text-primary">₹{item.price.toFixed(2)}<span className="text-[10px] text-secondary font-normal font-sans ml-0.5">/{item.unit}</span></p>
              </div>
              <button
                onClick={() => handleAddSavedToCart(item)}
                className="w-full mt-md py-2 bg-[#FFC107] hover:bg-[#fabd00] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-xl text-left">
        {settingsToast && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-sm rounded-xl font-bold flex items-center gap-xs">
            <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
            {settingsToast}
          </div>
        )}

        {/* Profile Settings Card */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg shadow-sm space-y-md">
          <div className="border-b border-[#E9ECEF] pb-sm">
            <h3 className="font-bold text-md text-[#0A0A0A]">Profile Settings</h3>
            <p className="text-secondary text-xs mt-0.5">Manage your personal profile and account credentials.</p>
          </div>
          <form onSubmit={handleSaveSettings} className="space-y-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Full Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl focus:border-[#FFC107] focus:ring-0 text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Company Name (Optional)</label>
                <input
                  type="text"
                  value={settingsForm.company}
                  onChange={(e) => setSettingsForm({ ...settingsForm, company: e.target.value })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl focus:border-[#FFC107] focus:ring-0 text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">City</label>
                <input
                  type="text"
                  required
                  value={settingsForm.city}
                  onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl focus:border-[#FFC107] focus:ring-0 text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">State</label>
                <input
                  type="text"
                  required
                  value={settingsForm.state}
                  onChange={(e) => setSettingsForm({ ...settingsForm, state: e.target.value })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl focus:border-[#FFC107] focus:ring-0 text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Default Delivery Address</label>
              <input
                type="text"
                required
                value={settingsForm.defaultAddress}
                onChange={(e) => setSettingsForm({ ...settingsForm, defaultAddress: e.target.value })}
                className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl focus:border-[#FFC107] focus:ring-0 text-xs bg-white text-[#0A0A0A] font-semibold"
              />
            </div>
            <button
              type="submit"
              className="px-xl py-3 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-xl transition-all text-xs font-label-caps flex items-center justify-center gap-xs shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Save Profile Changes
            </button>
          </form>
        </div>

        {/* Contact Credentials Card */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg shadow-sm space-y-md">
          <div className="border-b border-[#E9ECEF] pb-sm">
            <h3 className="font-bold text-md text-[#0A0A0A]">Contact Details &amp; Verification</h3>
            <p className="text-secondary text-xs mt-0.5">Manage and verify your contact email address and mobile number via OTP.</p>
          </div>
          
          <div className="space-y-md">
            {/* Email Address Section */}
            <div className="p-md bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-[#FFC107] text-[28px]">mail</span>
                  <div>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Email Address</p>
                    <h4 className="font-bold text-xs text-[#0A0A0A] mt-0.5">{settingsForm.email}</h4>
                  </div>
                </div>
                
                <div className="flex items-center gap-md">
                  {emailVerified && !isEditingEmail ? (
                    <span className="px-md py-1.5 bg-green-100 text-green-800 font-bold rounded-lg text-xs flex items-center gap-xs uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      Verified
                    </span>
                  ) : !emailVerified && !isEditingEmail ? (
                    <span className="px-md py-1.5 bg-amber-100 text-amber-800 font-bold rounded-lg text-xs flex items-center gap-xs uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Not Verified
                    </span>
                  ) : null}

                  {!isEditingEmail ? (
                    <button
                      onClick={() => {
                        setNewEmail(settingsForm.email);
                        setIsEditingEmail(true);
                        setEmailOtpSent(false);
                      }}
                      className="px-md py-1.5 bg-white border border-[#E9ECEF] hover:bg-background text-secondary hover:text-[#0A0A0A] font-bold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Change Email
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditingEmail(false)}
                      className="px-md py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {isEditingEmail && (
                <div className="border-t border-[#E9ECEF] pt-md space-y-md">
                  <div className="flex flex-col md:flex-row gap-md items-end">
                    <div className="flex-1 flex flex-col gap-xs">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">New Email Address</label>
                      <input
                        type="email"
                        disabled={emailOtpSent}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl focus:border-[#FFC107] focus:ring-0 text-xs bg-white text-[#0A0A0A] font-semibold disabled:bg-gray-100 disabled:text-gray-400"
                        placeholder="enter new email"
                      />
                    </div>
                    {!emailOtpSent && (
                      <button
                        onClick={handleRequestEmailOtp}
                        className="px-xl py-3 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-xl text-xs font-label-caps uppercase tracking-wider h-11 flex items-center justify-center gap-xs shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">send_to_mobile</span>
                        Send Verification OTP
                      </button>
                    )}
                  </div>

                  {emailOtpSent && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-center bg-white p-md rounded-2xl border border-[#E9ECEF] animate-fadeIn">
                      {/* Animated Illustration */}
                      <div className="md:col-span-1 flex flex-col items-center justify-center p-sm border-r border-[#E9ECEF] text-center">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-xs relative">
                          <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                          </svg>
                          <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                        </div>
                        <p className="font-bold text-[#0A0A0A] text-xs">Awaiting Verification</p>
                        <p className="text-[10px] text-secondary mt-0.5">Simulated OTP sent to email</p>
                      </div>

                      <div className="md:col-span-2 space-y-sm">
                        <div className="flex flex-col gap-xs">
                          <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Enter 6-Digit Email OTP</label>
                          <input
                            type="text"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                            className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-center text-md tracking-widest bg-white text-[#0A0A0A] font-bold focus:border-[#FFC107] focus:ring-0 outline-none"
                            placeholder="0 0 0 0 0 0"
                          />
                        </div>
                        <div className="flex gap-sm">
                          <button
                            onClick={handleVerifyEmailOtp}
                            className="flex-1 py-2.5 bg-[#0A0A0A] hover:bg-[#212529] text-white font-bold rounded-xl text-xs font-label-caps uppercase tracking-wider flex items-center justify-center gap-xs"
                          >
                            <span className="material-symbols-outlined text-[16px]">done_all</span>
                            Verify &amp; Save
                          </button>
                          <button
                            onClick={handleRequestEmailOtp}
                            disabled={emailOtpCountdown > 0}
                            className="py-2.5 px-md bg-white border border-[#E9ECEF] hover:bg-background disabled:bg-gray-200 disabled:text-gray-400 text-[#0A0A0A] font-bold rounded-xl text-xs transition-all shadow-sm"
                          >
                            {emailOtpCountdown > 0 ? `Resend (${emailOtpCountdown}s)` : 'Resend'}
                          </button>
                        </div>
                        {simulatedEmailUrl ? (
                          <div className="bg-green-50 border border-green-200 text-green-800 text-[11px] p-sm rounded-xl flex items-start gap-xs mt-xs">
                            <span className="material-symbols-outlined text-green-600 text-[16px]">mail</span>
                            <div>
                              <p className="font-bold text-xs text-green-900">Actual Email Sent!</p>
                              <a href={simulatedEmailUrl} target="_blank" rel="noreferrer" className="underline font-semibold text-green-700 hover:text-green-950 transition-colors mt-0.5 inline-block text-[10px]">
                                Click here to open Ethereal Test Inbox &amp; retrieve your OTP code
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-[10px] p-sm rounded-xl leading-normal flex items-start gap-xs mt-xs">
                            <span className="material-symbols-outlined text-blue-600 text-[16px]">info</span>
                            <span>Email sent successfully! If using custom SMTP, check your inbox. Otherwise, check console logs.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Phone Number Section */}
            <div className="p-md bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] space-y-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
                <div className="flex items-center gap-md">
                  <span className="material-symbols-outlined text-[#FFC107] text-[28px]">call</span>
                  <div>
                    <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Phone Number</p>
                    <h4 className="font-bold text-xs text-[#0A0A0A] mt-0.5">{settingsForm.phone}</h4>
                  </div>
                </div>
                
                <div className="flex items-center gap-md">
                  {!isEditingPhone ? (
                    <button
                      onClick={() => {
                        setNewPhone(settingsForm.phone);
                        setIsEditingPhone(true);
                      }}
                      className="px-md py-1.5 bg-white border border-[#E9ECEF] hover:bg-background text-secondary hover:text-[#0A0A0A] font-bold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Change Phone
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditingPhone(false);
                      }}
                      className="px-md py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {isEditingPhone && (
                <div className="border-t border-[#E9ECEF] pt-md space-y-md">
                  <div className="flex flex-col md:flex-row gap-md items-end">
                    <div className="flex-1 flex flex-col gap-xs">
                      <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">New Phone Number</label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                        className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl focus:border-[#FFC107] focus:ring-0 text-xs bg-white text-[#0A0A0A] font-semibold"
                        placeholder="enter 10-digit number"
                      />
                    </div>
                    <button
                      onClick={handleSavePhone}
                      className="px-xl py-3 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-xl text-xs font-label-caps uppercase tracking-wider h-11 flex items-center justify-center gap-xs shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Save Phone
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Regional Coverage Card */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg shadow-sm space-y-md">
          <div className="border-b border-[#E9ECEF] pb-sm">
            <h3 className="font-bold text-md text-[#0A0A0A]">Regional Service Coverage</h3>
            <p className="text-secondary text-xs mt-0.5">Your default service region for logistics, product listings, and partner rates.</p>
          </div>
          <div className="p-md bg-[#F8F9FA] rounded-2xl border border-[#E9ECEF] flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px]">map</span>
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Active Coverage</p>
                <h4 className="font-bold text-xs text-[#0A0A0A] mt-0.5">{settingsForm.city}, {settingsForm.state}</h4>
              </div>
            </div>
            <span className="px-md py-1.5 bg-primary/10 text-primary font-bold rounded-lg text-xs flex items-center gap-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">location_searching</span>
              Active Coverage Area
            </span>
          </div>
        </div>

        {/* Saved Addresses Section directly embedded */}
        <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg shadow-sm space-y-md">
          <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-sm">
            <div>
              <h3 className="font-bold text-md text-[#0A0A0A]">Saved Delivery Addresses</h3>
              <p className="text-secondary text-xs mt-0.5">Manage delivery locations and shipping coordinates (Min 1, Max 10).</p>
            </div>
            {addresses.length < 10 && (
              <button
                onClick={() => {
                  const newAddr = prompt('Enter new delivery address:');
                  if (newAddr && newAddr.trim()) {
                    setAddresses([...addresses, newAddr.trim()]);
                  }
                }}
                className="px-md py-1.5 bg-[#FFC107] text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded-lg text-xs transition-colors flex items-center gap-xs shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add New Address
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-xs">
            {addresses.map((addr, idx) => (
              <div key={idx} className="bg-[#F8F9FA] p-md rounded-2xl border border-[#E9ECEF] flex flex-col justify-between gap-md relative text-left text-[#0A0A0A] font-semibold">
                <div className="space-y-xs">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                    <span className="text-xs font-bold text-[#0A0A0A] font-label-caps uppercase tracking-wider">
                      {idx === 0 ? 'Default Delivery Address' : `Address #${idx + 1}`}
                    </span>
                  </div>
                  <p className="text-xs text-secondary font-medium leading-relaxed mt-sm pr-md">{addr}</p>
                </div>
                <div className="flex gap-sm border-t border-[#E9ECEF] pt-sm">
                  <button
                    onClick={() => {
                      const updated = prompt('Edit address:', addr);
                      if (updated && updated.trim()) {
                        const newAddrs = [...addresses];
                        newAddrs[idx] = updated.trim();
                        setAddresses(newAddrs);
                      }
                    }}
                    className="text-[10px] font-bold text-secondary hover:text-primary hover:underline uppercase tracking-wide"
                  >
                    Edit
                  </button>
                  {addresses.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this address?')) {
                          setAddresses(addresses.filter((_, i) => i !== idx));
                        }
                      }}
                      className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wide"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPayment = () => {
    return (
      <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg text-left shadow-sm space-y-md">
        <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-sm">
          <div>
            <h3 className="font-bold text-[#0A0A0A] text-md">Manage Payment Options</h3>
            <p className="text-secondary text-xs mt-0.5">Securely store your corporate cards and bank details for faster checkout.</p>
          </div>
          <button
            onClick={() => alert('Simulator: Add Payment Method modal.')}
            className="px-md py-1.5 bg-[#FFC107] text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded-lg text-xs transition-colors flex items-center gap-xs shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Add Payment Method
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-xs">
          <div className="bg-gradient-to-br from-[#1a1c1c] to-[#2a2d2d] text-white p-md rounded-2xl border border-[#E9ECEF]/10 flex flex-col justify-between h-[160px] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 translate-x-1/3 pointer-events-none"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-label-caps">Corporate Card</p>
                <h4 className="font-bold text-sm mt-1">HDFC Platinum Business</h4>
              </div>
              <span className="material-symbols-outlined text-[#FFC107] text-[28px]">credit_card</span>
            </div>
            <div>
              <p className="font-mono text-sm tracking-wider">•••• •••• •••• 4102</p>
              <div className="flex justify-between items-end mt-sm text-[10px] text-gray-400">
                <span>CARDHOLDER: {user?.name?.toUpperCase()}</span>
                <span>EXPIRES: 12/29</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-md rounded-2xl border border-[#E9ECEF] flex flex-col justify-between h-[160px] shadow-sm">
            <div className="space-y-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-primary text-[24px]">qr_code_2</span>
                  <div>
                    <h4 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wide">UPI Auto-pay</h4>
                    <p className="text-[10px] text-secondary mt-0.5">Primary UPI Handle</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-[9px] font-bold px-sm py-0.5 rounded-full uppercase tracking-wider">Verified</span>
              </div>
              <p className="font-mono text-xs font-semibold text-secondary pt-xs">admin@okaxis</p>
            </div>
            <div className="flex gap-sm border-t border-[#E9ECEF] pt-sm">
              <button
                onClick={() => alert('Simulator: Remove UPI handle')}
                className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wide"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRewards = () => {
    const parseAmount = (amtStr: string | number | undefined) => {
      if (!amtStr) return 0;
      const cleanStr = typeof amtStr === 'number' ? String(amtStr) : amtStr.replace(/[^\d.]/g, '');
      const val = parseFloat(cleanStr);
      return isNaN(val) ? 0 : val;
    };

    // 1. Calculate Monthly Spend dynamically from actual/mock orders
    const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
    const monthlyOrders = finalOrders.filter(o => o.date && o.date.includes(currentMonthName));
    const calculatedMonthlySpend = monthlyOrders.reduce((sum, o) => sum + parseAmount(o.amount), 0);

    // 2. Calculate Annual Spend dynamically
    const calculatedAnnualSpend = finalOrders.reduce((sum, o) => sum + parseAmount(o.amount), 0);

    // 3. Calculate BuildPoints dynamically based on actual orders
    const calculatePointsFromOrders = (orders: ClientOrder[], role: string) => {
      let totalPoints = 0;
      orders.forEach((o: ClientOrder) => {
        const amt = parseAmount(o.amount);
        if (amt < 500) return;
        
        if (role === 'Business') {
          // B2B Base: 3 points per 500 spend
          const base = Math.floor(amt / 500) * 3;
          let bonus = 0;
          if (amt >= 500000) bonus = Math.floor(amt / 1000) * 8;
          else if (amt >= 250000) bonus = Math.floor(amt / 1000) * 4;
          else if (amt >= 100000) bonus = Math.floor(amt / 1000) * 2;
          else if (amt >= 50000) bonus = Math.floor(amt / 1000) * 1;
          totalPoints += base + bonus;
        } else {
          // B2C Base: 2 points per 500 spend
          const base = Math.floor(amt / 500) * 2;
          let bonus = 0;
          if (amt >= 250000) bonus = Math.floor(amt / 1000) * 6;
          else if (amt >= 100000) bonus = Math.floor(amt / 1000) * 4;
          else if (amt >= 50000) bonus = Math.floor(amt / 1000) * 2;
          else if (amt >= 25000) bonus = Math.floor(amt / 1000) * 1;
          totalPoints += base + bonus;
        }
      });
      return totalPoints;
    };

    // Sum base points from orders and add any claimed challenge rewards
    const challengeBonus = (challengesClaimed.includes('challenge_profile') ? 100 : 0) +
      (challengesClaimed.includes('challenge_orders') ? 100 : 0) +
      (challengesClaimed.includes('challenge_service') ? 150 : 0) +
      (challengesClaimed.includes('challenge_spend') && calculatedMonthlySpend >= 25000 ? 250 : 0);

    const b2cPointsVal = Math.max(0, calculatePointsFromOrders(finalOrders, 'Individual') + challengeBonus - redeemedPoints);
    const b2bPointsVal = Math.max(0, calculatePointsFromOrders(finalOrders, 'Business') + challengeBonus - redeemedPoints);

    // Professional points linked to services completed
    const proCompletedProjects = finalServices.filter(s => s.status === 'Completed').length;
    const proInProgressProjects = finalServices.filter(s => s.status === 'In Progress').length;
    const proPointsVal = Math.max(0, (proCompletedProjects * 100) + (proInProgressProjects * 25) + 100 + 50 + 25 + 20 +
      (challengesClaimed.includes('challenge_profile') ? 100 : 0) +
      (challengesClaimed.includes('challenge_orders') ? 100 : 0) - redeemedPoints);

    // Resolve user's true loyalty view role
    const resolvedRole = user?.role === 'Professional' ? 'Professional' :
      ['Business', 'Contractor', 'Supplier'].includes(user?.role || '') ? 'Business' :
      user?.role === 'Admin' ? 'Admin' : 'Individual';

    // Curated dynamic tier calculations
    const getB2cTier = (spend: number) => {
      if (spend < 25000) return { name: 'Explorer', badge: '🔍 Explorer', bonusText: 'Base Rewards' };
      if (spend < 50000) return { name: 'Creator', badge: '✨ Creator', bonusText: '+1 Bonus Point per ₹1,000' };
      if (spend < 100000) return { name: 'Builder', badge: '🏗️ Builder', bonusText: '+2 Bonus Points per ₹1,000' };
      if (spend < 250000) return { name: 'Architect', badge: '📐 Architect', bonusText: '+4 Bonus Points per ₹1,000' };
      return { name: 'Visionary', badge: '🚀 Visionary', bonusText: 'Highest Multiplier (VIP)' };
    };

    const getB2bTier = (spend: number) => {
      if (spend < 50000) return { name: 'Explorer Business', badge: '🔍 Explorer Business', bonusText: 'Base Rewards' };
      if (spend < 100000) return { name: 'Creator Business', badge: '✨ Creator Business', bonusText: '+1 Bonus Point per ₹1,000' };
      if (spend < 250000) return { name: 'Builder Business', badge: '🏗️ Builder Business', bonusText: '+2 Bonus Points per ₹1,000' };
      if (spend < 500000) return { name: 'Architect Business', badge: '📐 Architect Business', bonusText: '+4 Bonus Points per ₹1,000' };
      return { name: 'Visionary Business', badge: '🚀 Visionary Business', bonusText: 'Highest Multiplier + Relationship Manager' };
    };

    const getProTier = (points: number) => {
      if (points < 1000) return { name: 'Explorer Pro', badge: '🔍 Explorer Pro', rank: 'Base Tier' };
      if (points < 5000) return { name: 'Creator Pro', badge: '✨ Creator Pro', rank: 'Improved Search Ranking' };
      if (points < 15000) return { name: 'Builder Pro', badge: '🏗️ Builder Pro', rank: 'Featured Profile Opportunities' };
      if (points < 50000) return { name: 'Architect Pro', badge: '📐 Architect Pro', rank: 'Premium Expert Placement' };
      return { name: 'Visionary Pro', badge: '🚀 Visionary Pro', rank: 'Top Listing Priority' };
    };

    // Calculate progression details
    const activeB2c = getB2cTier(calculatedMonthlySpend);
    const activeB2b = getB2bTier(calculatedMonthlySpend);
    const activePro = getProTier(proPointsVal);

    // Dynamic challenge values
    const challenges = [
      {
        id: 'challenge_profile',
        title: 'Complete Profile Details',
        desc: 'Finish filling out your settings details.',
        points: 100,
        current: 1,
        target: 1
      },
      {
        id: 'challenge_spend',
        title: 'Monthly Spend Target',
        desc: 'Place orders totaling ₹25,000 this month.',
        points: 250,
        current: calculatedMonthlySpend,
        target: 25000
      },
      {
        id: 'challenge_orders',
        title: 'Procure 3 Times',
        desc: 'Submit at least 3 distinct product orders.',
        points: 100,
        current: finalOrders.length,
        target: 3
      },
      {
        id: 'challenge_service',
        title: 'Book Professional Service',
        desc: 'Hire an expert service technician or contractor.',
        points: 150,
        current: finalServices.length,
        target: 1
      }
    ];

    const triggerClaimChallenge = (id: string, pts: number) => {
      if (challengesClaimed.includes(id)) return;
      setChallengesClaimed([...challengesClaimed, id]);
      
      setRepeatToast(`Claimed ${pts} BuildPoints successfully!`);
      setTimeout(() => setRepeatToast(null), 3000);
    };

    return (
      <div className="space-y-xl text-left">
        {/* Toast Alerts inside dashboard */}
        {repeatToast && (
          <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-sm rounded-xl font-bold flex items-center gap-xs animate-slideDown shadow-sm">
            <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
            {repeatToast}
          </div>
        )}

        {/* Ecosystem Title & Description */}
        <div className="bg-[#1a1c1c] text-white p-xl rounded-3xl relative overflow-hidden flex flex-col justify-center min-h-[160px] shadow-md">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-[#FFC107]/10 skew-x-12 translate-x-1/3 pointer-events-none"></div>
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[#FFC107] text-[40px] animate-pulse">stars</span>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">ARCUS BuildPoints™</h2>
              <p className="text-[#FFC107] text-xs font-bold font-label-caps uppercase tracking-widest mt-0.5">Build More. Earn More.</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-sm max-w-2xl leading-relaxed">
            Consolidate your procurement, hire verified contractors, and execute projects to accumulate premium points. Redeem BuildPoints directly for invoice credits, consultation hours, and premium services.
          </p>
        </div>

        {/* 1. INDIVIDUAL VIEW */}
        {resolvedRole === 'Individual' && (
          <div className="space-y-lg">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left relative overflow-hidden">
                <span className="absolute right-md top-md material-symbols-outlined text-[#FFC107] text-[24px]">stars</span>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">BuildPoints Balance</p>
                <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">{b2cPointsVal.toLocaleString()}</p>
                <div className="text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-sm py-1 font-bold w-fit mt-md">
                  Equivalent to ₹{(b2cPointsVal * adminConfig.conversionRate).toLocaleString()} ARCUS Credit
                </div>
              </div>
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Monthly Spend Tracker</p>
                <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">₹{calculatedMonthlySpend.toLocaleString()}</p>
                <p className="text-[10px] text-secondary font-medium mt-md">Rate: ₹500 spend = {adminConfig.b2cBaseRate} BuildPoints</p>
              </div>
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Tier Status</p>
                <p className="text-[20px] font-extrabold text-primary mt-sm leading-none flex items-center gap-xs">
                  {activeB2c.badge}
                </p>
                <p className="text-[10px] text-secondary font-medium mt-md">{activeB2c.bonusText}</p>
              </div>
            </div>

            {/* Individual Accelerator Tiers */}
            <div className="space-y-sm">
              <h4 className="font-bold text-[#0A0A0A] text-xs uppercase font-label-caps tracking-wider">Individual Accelerator Tiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-sm">
                {[
                  { range: '₹0 - ₹24,999', badge: '🔍 Explorer', points: 'Base Rate' },
                  { range: '₹25,000 - ₹49,999', badge: '✨ Creator', points: '+1 Bonus Pt/₹1k' },
                  { range: '₹50,000 - ₹99,999', badge: '🏗️ Builder', points: '+2 Bonus Pts/₹1k' },
                  { range: '₹1,00,000 - ₹2,49,999', badge: '📐 Architect', points: '+4 Bonus Pts/₹1k' },
                  { range: '₹2,50,000+', badge: '🚀 Visionary', points: 'VIP Priority status' }
                ].map((t, i) => {
                  const isCurrent = activeB2c.name === t.badge.split(' ')[1];
                  return (
                    <div
                      key={i}
                      className={`p-sm rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'border-[#FFC107] bg-[#FFFDF5] ring-1 ring-[#FFC107]'
                          : 'border-[#E9ECEF] bg-white'
                      }`}
                    >
                      <p className="text-[10px] text-secondary font-bold font-mono">{t.range}</p>
                      <p className="font-bold text-xs mt-1 text-[#0A0A0A]">{t.badge}</p>
                      <p className="text-[9px] text-[#FFC107] font-bold mt-1 uppercase tracking-wider">{t.points}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 2. BUSINESS VIEW */}
        {resolvedRole === 'Business' && (
          <div className="space-y-lg">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left relative overflow-hidden">
                <span className="absolute right-md top-md material-symbols-outlined text-[#FFC107] text-[24px]">stars</span>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Business BuildPoints</p>
                <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">{b2bPointsVal.toLocaleString()}</p>
                <div className="text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-sm py-1 font-bold w-fit mt-md">
                  Equivalent to ₹{(b2bPointsVal * adminConfig.conversionRate).toLocaleString()} ARCUS Credit
                </div>
              </div>
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Monthly Procurement Spend</p>
                <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">₹{calculatedMonthlySpend.toLocaleString()}</p>
                <p className="text-[10px] text-secondary font-medium mt-md">Rate: ₹500 spend = {adminConfig.b2bBaseRate} BuildPoints</p>
              </div>
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Business Tier Status</p>
                <p className="text-[20px] font-extrabold text-primary mt-sm leading-none flex items-center gap-xs">
                  {activeB2b.badge}
                </p>
                <p className="text-[10px] text-secondary font-medium mt-md">{activeB2b.bonusText}</p>
              </div>
            </div>

            {/* Annual B2B Recognition Track */}
            <div className="bg-white border border-[#E9ECEF] p-lg rounded-2xl shadow-sm space-y-md text-left">
              <div className="border-b border-[#E9ECEF] pb-xs">
                <h4 className="font-bold text-sm text-[#0A0A0A] flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[#FFC107]">emoji_events</span>
                  Annual Business Recognition Milestone
                </h4>
                <p className="text-[11px] text-secondary">Recognizing strategic procurement volume across the platform.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-sm">
                <div>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Annual Spend Progress</p>
                  <p className="text-xl font-extrabold text-[#0A0A0A] mt-xs">₹{(calculatedAnnualSpend / 100000).toFixed(2)} Lakh / ₹50.00 Lakh</p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-[#F8F9FA] h-2.5 rounded-full overflow-hidden border border-[#E9ECEF] mt-sm">
                    <div
                      className="bg-green-600 h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (calculatedAnnualSpend / 5000000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Current Recognition Status</p>
                  <span className="mt-xs inline-block px-sm py-1 bg-green-50 border border-green-200 text-green-800 font-bold rounded-lg text-xs w-fit uppercase tracking-wider">
                    {calculatedAnnualSpend >= 50000000 ? 'ARCUS Elite Procurement Partner' :
                     calculatedAnnualSpend >= 10000000 ? 'ARCUS Premier Partner' :
                     calculatedAnnualSpend >= 5000000 ? 'ARCUS Strategic Partner' :
                     calculatedAnnualSpend >= 2500000 ? 'ARCUS Preferred Business' :
                     'Member Business'}
                  </span>
                </div>
              </div>
            </div>

            {/* Business Accelerator Tiers */}
            <div className="space-y-sm">
              <h4 className="font-bold text-[#0A0A0A] text-xs uppercase font-label-caps tracking-wider">Business Loyalty Tiers</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-sm">
                {[
                  { range: '₹0 - ₹49,999', badge: '🔍 Explorer Business', points: 'Base Rate' },
                  { range: '₹50,000 - ₹99,999', badge: '✨ Creator Business', points: '+1 Bonus Pt/₹1k' },
                  { range: '₹1,00,000 - ₹2,49,999', badge: '🏗️ Builder Business', points: '+2 Bonus Pts/₹1k' },
                  { range: '₹2,50,000 - ₹4,99,999', badge: '📐 Architect Business', points: '+4 Bonus Pts/₹1k' },
                  { range: '₹5,00,000+', badge: '🚀 Visionary Business', points: 'ARCUS Premier Badge' }
                ].map((t, i) => {
                  const isCurrent = activeB2b.name === t.badge.split(' ').slice(1).join(' ');
                  return (
                    <div
                      key={i}
                      className={`p-sm rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'border-[#FFC107] bg-[#FFFDF5] ring-1 ring-[#FFC107]'
                          : 'border-[#E9ECEF] bg-white'
                      }`}
                    >
                      <p className="text-[10px] text-secondary font-bold font-mono">{t.range}</p>
                      <p className="font-bold text-[11px] mt-1 text-[#0A0A0A]">{t.badge}</p>
                      <p className="text-[9px] text-[#FFC107] font-bold mt-1 uppercase tracking-wider">{t.points}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 3. PROFESSIONAL VIEW */}
        {resolvedRole === 'Professional' && (
          <div className="space-y-lg">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left relative overflow-hidden">
                <span className="absolute right-md top-md material-symbols-outlined text-[#FFC107] text-[24px]">stars</span>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Pro BuildPoints Balance</p>
                <p className="text-[28px] font-extrabold text-[#0A0A0A] mt-sm leading-none">{proPointsVal.toLocaleString()}</p>
                <div className="text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-sm py-1 font-bold w-fit mt-md">
                  Equivalent to ₹{(proPointsVal * adminConfig.conversionRate).toLocaleString()} ARCUS Credit
                </div>
              </div>
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Tier Status Rank</p>
                <p className="text-[20px] font-extrabold text-primary mt-sm leading-none flex items-center gap-xs">
                  {activePro.badge}
                </p>
                <p className="text-[10px] text-secondary font-medium mt-md">{activePro.rank}</p>
              </div>
              <div className="bg-white border border-[#E9ECEF] p-md rounded-2xl shadow-sm text-left">
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider font-label-caps">Pro Engagement Level</p>
                <p className="text-[20px] font-extrabold text-[#0A0A0A] mt-sm leading-none">ARCUS Expert</p>
                <p className="text-[10px] text-secondary font-medium mt-md">Points earned via active service bookings</p>
              </div>
            </div>

            {/* Professional Loyalty Tiers */}
            <div className="space-y-sm">
              <h4 className="font-bold text-[#0A0A0A] text-xs uppercase font-label-caps tracking-wider">Professional Tiers & Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-sm">
                {[
                  { range: '0 - 999 Pts', badge: '🔍 Explorer Pro', benefit: 'Verified Profile' },
                  { range: '1,000 - 4,999 Pts', badge: '✨ Creator Pro', benefit: 'Improved Search Ranking' },
                  { range: '5,000 - 14,999 Pts', badge: '🏗️ Builder Pro', benefit: 'Priority Lead Notices' },
                  { range: '15,000 - 49,999 Pts', badge: '📐 Architect Pro', benefit: 'Expert Badging' },
                  { range: '50,000+ Pts', badge: '🚀 Visionary Pro', benefit: 'Top Lead Distribution' }
                ].map((t, i) => {
                  const isCurrent = activePro.name === t.badge.split(' ').slice(1).join(' ');
                  return (
                    <div
                      key={i}
                      className={`p-sm rounded-xl border text-center transition-all ${
                        isCurrent
                          ? 'border-[#FFC107] bg-[#FFFDF5] ring-1 ring-[#FFC107]'
                          : 'border-[#E9ECEF] bg-white'
                      }`}
                    >
                      <p className="text-[10px] text-secondary font-bold font-mono">{t.range}</p>
                      <p className="font-bold text-[11px] mt-1 text-[#0A0A0A]">{t.badge}</p>
                      <p className="text-[9px] text-[#FFC107] font-bold mt-1 uppercase tracking-wider">{t.benefit}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. ADMIN CONFIG VIEW */}
        {resolvedRole === 'Admin' && (
          <div className="space-y-lg text-left bg-white border border-[#E9ECEF] rounded-2xl p-lg shadow-sm">
            <div className="border-b border-[#E9ECEF] pb-sm">
              <h3 className="font-bold text-md text-[#0A0A0A] flex items-center gap-xs">
                <span className="material-symbols-outlined text-[#FFC107]">admin_panel_settings</span>
                Global Admin Loyalty Configurations
              </h3>
              <p className="text-secondary text-xs mt-0.5">Manage base points multipliers, redemption rates, and referral incentives.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md pt-sm">
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">B2C Base Earning Rate (Points per ₹500)</label>
                <input
                  type="number"
                  value={adminConfig.b2cBaseRate}
                  onChange={(e) => setAdminConfig({ ...adminConfig, b2cBaseRate: Number(e.target.value) })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">B2B Base Earning Rate (Points per ₹500)</label>
                <input
                  type="number"
                  value={adminConfig.b2bBaseRate}
                  onChange={(e) => setAdminConfig({ ...adminConfig, b2bBaseRate: Number(e.target.value) })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Redemption Value (INR per 1 Point)</label>
                <input
                  type="number"
                  step="0.01"
                  value={adminConfig.conversionRate}
                  onChange={(e) => setAdminConfig({ ...adminConfig, conversionRate: Number(e.target.value) })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Referral Rewards (Points)</label>
                <input
                  type="number"
                  value={adminConfig.referralB2c}
                  onChange={(e) => setAdminConfig({ ...adminConfig, referralB2c: Number(e.target.value) })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Point Expiry Policies (Months)</label>
                <input
                  type="number"
                  value={adminConfig.pointsExpiryMonths}
                  onChange={(e) => setAdminConfig({ ...adminConfig, pointsExpiryMonths: Number(e.target.value) })}
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-xs bg-white text-[#0A0A0A] font-semibold"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setRepeatToast('Loyalty program configurations saved successfully!');
                setTimeout(() => setRepeatToast(null), 3000);
              }}
              className="px-xl py-2.5 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-xl text-xs font-label-caps uppercase tracking-wider flex items-center justify-center gap-xs shadow-sm mt-md"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              Save Configurations
            </button>
          </div>
        )}

        {/* POINTS REDEMPTION SYSTEM */}
        {resolvedRole !== 'Admin' && (
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg text-left shadow-sm space-y-md">
            <div className="border-b border-[#E9ECEF] pb-sm">
              <h4 className="font-bold text-md text-[#0A0A0A] flex items-center gap-xs">
                <span className="material-symbols-outlined text-[#FFC107]">redeem</span>
                Redeem BuildPoints™
              </h4>
              <p className="text-secondary text-xs mt-0.5">
                Convert your active BuildPoints into discount coupons redeemable once on your checkout orders (1 BuildPoint = ₹{adminConfig.conversionRate.toFixed(2)} Credit).
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-lg items-end">
              <div className="flex-1 flex flex-col gap-xs">
                <label className="text-[10px] font-bold text-secondary uppercase tracking-wider font-label-caps">Select Points to Redeem</label>
                <select
                  id="pointsToRedeemSelect"
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-xs bg-white text-[#0A0A0A] font-semibold focus:border-[#FFC107] focus:ring-0 outline-none"
                  onChange={(e) => {
                    const val = e.target.value;
                    const customInput = document.getElementById('customPointsInput') as HTMLInputElement;
                    if (val === 'custom') {
                      customInput.style.display = 'block';
                      customInput.focus();
                    } else {
                      customInput.style.display = 'none';
                      customInput.value = val;
                    }
                  }}
                  defaultValue="500"
                >
                  <option value="500">500 points (₹250 Credit)</option>
                  <option value="1000">1,000 points (₹500 Credit)</option>
                  <option value="2000">2,000 points (₹1,000 Credit)</option>
                  <option value="5000">5,000 points (₹2,500 Credit)</option>
                  <option value="custom">Custom points amount...</option>
                </select>
                <input
                  type="number"
                  id="customPointsInput"
                  placeholder="Enter custom points amount"
                  className="w-full h-11 px-md border border-[#E9ECEF] rounded-xl text-xs bg-white text-[#0A0A0A] font-semibold mt-sm focus:border-[#FFC107] focus:ring-0 outline-none"
                  style={{ display: 'none' }}
                  min="100"
                  defaultValue="500"
                />
              </div>
              
              <button
                onClick={() => {
                  const selectEl = document.getElementById('pointsToRedeemSelect') as HTMLSelectElement;
                  const customInput = document.getElementById('customPointsInput') as HTMLInputElement;
                  let pointsToRedeem: number;
                  if (selectEl.value === 'custom') {
                    pointsToRedeem = Number(customInput.value);
                  } else {
                    pointsToRedeem = Number(selectEl.value);
                  }

                  if (isNaN(pointsToRedeem) || pointsToRedeem < 100) {
                    alert('Please enter a valid points amount of at least 100.');
                    return;
                  }

                  const activePoints = resolvedRole === 'Individual' ? b2cPointsVal :
                                       resolvedRole === 'Business' ? b2bPointsVal : proPointsVal;

                  if (activePoints < pointsToRedeem) {
                    alert(`Insufficient points balance. You currently have ${activePoints.toLocaleString()} BuildPoints.`);
                    return;
                  }

                  if (confirm(`Are you sure you want to redeem ${pointsToRedeem.toLocaleString()} BuildPoints for ₹${(pointsToRedeem * adminConfig.conversionRate).toLocaleString()} credit?`)) {
                    const newRedeemedTotal = redeemedPoints + pointsToRedeem;
                    localStorage.setItem(`arcus-user-redeemed-points-${user?.id || ''}`, String(newRedeemedTotal));
                    setRedeemedPoints(newRedeemedTotal);

                    // Generate a 16-digit code: BP-XXXX-XXXX-XXXX-XXXX
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let code = 'BP-';
                    for (let i = 0; i < 4; i++) {
                      for (let j = 0; j < 4; j++) {
                        code += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      if (i < 3) code += '-';
                    }

                    const newCoupon = {
                      code,
                      points: pointsToRedeem,
                      discountValue: pointsToRedeem * adminConfig.conversionRate,
                      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      used: false
                    };

                    const updatedCoupons = [newCoupon, ...userCoupons];
                    localStorage.setItem(`arcus-user-coupons-${user?.id || ''}`, JSON.stringify(updatedCoupons));
                    setUserCoupons(updatedCoupons);

                    setRepeatToast(`Successfully generated Coupon ${code}!`);
                    setTimeout(() => setRepeatToast(null), 4000);
                  }
                }}
                className="px-xl py-3 bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold rounded-xl text-xs font-label-caps uppercase tracking-wider flex items-center justify-center gap-xs shadow-sm h-11 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
                Redeem &amp; Generate Coupon
              </button>
            </div>

            {/* Coupons list */}
            {userCoupons.length > 0 && (
              <div className="pt-md border-t border-[#E9ECEF] space-y-sm">
                <h5 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wider font-label-caps">Your Redeemed Coupon Codes</h5>
                <div className="border border-[#E9ECEF] rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[10px] font-bold text-secondary uppercase tracking-wider">
                        <th className="p-sm">Coupon Code</th>
                        <th className="p-sm">Discount Value</th>
                        <th className="p-sm">Points Used</th>
                        <th className="p-sm">Redeemed Date</th>
                        <th className="p-sm text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECEF] text-xs">
                      {userCoupons.map((coupon, idx) => (
                        <tr key={idx} className="hover:bg-[#F8F9FA]/50 transition-colors">
                          <td className="p-sm font-mono font-bold text-primary select-all">{coupon.code}</td>
                          <td className="p-sm font-bold text-[#0A0A0A]">₹{coupon.discountValue.toLocaleString()}</td>
                          <td className="p-sm text-secondary">{coupon.points.toLocaleString()} pts</td>
                          <td className="p-sm text-secondary">{coupon.date}</td>
                          <td className="p-sm text-right">
                            <span className={`inline-block px-sm py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                              coupon.used
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-green-100 text-green-800 animate-pulse'
                            }`}>
                              {coupon.used ? 'Used' : 'Active (Unused)'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. MONTHLY CHALLENGES SECTION */}
        {resolvedRole !== 'Admin' && (
          <div className="space-y-sm text-left">
            <h4 className="font-bold text-[#0A0A0A] text-xs uppercase font-label-caps tracking-wider">Active Monthly Challenges</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {challenges.map((c) => {
                const isClaimed = challengesClaimed.includes(c.id);
                const isCompleted = c.current >= c.target;
                return (
                  <div key={c.id} className="bg-white border border-[#E9ECEF] p-md rounded-2xl flex flex-col justify-between gap-sm hover:border-[#FFC107] transition-all shadow-sm">
                    <div className="flex justify-between items-start gap-md">
                      <div className="space-y-1">
                        <span className="bg-[#FFC107]/10 text-[#FFC107] font-bold px-sm py-0.5 rounded w-fit text-[9px] font-mono tracking-wider">+{c.points} PTS</span>
                        <h5 className="font-bold text-xs text-[#0A0A0A] mt-sm">{c.title}</h5>
                        <p className="text-[10px] text-secondary leading-normal">{c.desc}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#FFC107] text-[24px] shrink-0">sports_esports</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-[#E9ECEF] pt-sm mt-xs">
                      <div className="w-1/2 bg-[#F8F9FA] h-2 rounded-full overflow-hidden border border-[#E9ECEF]">
                        <div
                          className="bg-[#FFC107] h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (c.current / c.target) * 100)}%` }}
                        ></div>
                      </div>
                      <button
                        disabled={isClaimed || !isCompleted}
                        onClick={() => triggerClaimChallenge(c.id, c.points)}
                        className={`px-sm py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          isClaimed
                            ? 'bg-gray-100 text-secondary cursor-not-allowed'
                            : isCompleted
                            ? 'bg-[#FFC107] text-[#0A0A0A] hover:bg-[#fabd00]'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isClaimed ? 'Claimed' : isCompleted ? 'Claim Reward' : 'In Progress'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. REFERRAL PROGRAM */}
        {resolvedRole !== 'Admin' && (
          <div className="bg-white border border-[#E9ECEF] rounded-2xl p-lg text-left shadow-sm space-y-sm">
            <h4 className="font-bold text-[#0A0A0A] text-xs uppercase font-label-caps tracking-wider">Referral Rewards Program</h4>
            <p className="text-secondary text-xs">Invite colleagues, partners, or fellow professionals and earn bonus BuildPoints upon their first transaction.</p>
            
            <div className="bg-[#F8F9FA] p-md rounded-2xl border border-[#E9ECEF] flex flex-col md:flex-row justify-between items-start md:items-center gap-md mt-sm">
              <div className="space-y-xs">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider font-label-caps">Your Referral Link</span>
                <p className="font-mono text-xs text-secondary mt-1">https://arcus.in/refer?code=REF-${user?.id?.substring(0,6).toUpperCase() || 'USER12'}</p>
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://arcus.in/refer?code=REF-${user?.id?.substring(0,6).toUpperCase() || 'USER12'}`);
                    setRepeatToast('Referral link copied to clipboard!');
                    setTimeout(() => setRepeatToast(null), 3000);
                  }}
                  className="px-md py-1.5 bg-white border border-[#E9ECEF] text-[#0A0A0A] hover:bg-background font-bold rounded-lg text-xs transition-colors flex items-center gap-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  Copy Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-sm pt-xs text-center text-xs">
              <div className="border border-[#E9ECEF] bg-white p-sm rounded-xl">
                <p className="font-bold text-[#0A0A0A]">B2C Referral</p>
                <p className="text-secondary mt-1">Friend registers &amp; buys</p>
                <p className="text-[#FFC107] font-bold mt-1">+{adminConfig.referralB2c} BuildPoints</p>
              </div>
              <div className="border border-[#E9ECEF] bg-white p-sm rounded-xl">
                <p className="font-bold text-[#0A0A0A]">B2B Referral</p>
                <p className="text-secondary mt-1">Business registers &amp; buys</p>
                <p className="text-[#FFC107] font-bold mt-1">+{adminConfig.referralB2b} BuildPoints</p>
              </div>
              <div className="border border-[#E9ECEF] bg-white p-sm rounded-xl">
                <p className="font-bold text-[#0A0A0A]">Pro Referral</p>
                <p className="text-secondary mt-1">Pro completes first project</p>
                <p className="text-[#FFC107] font-bold mt-1">+{adminConfig.referralPro} BuildPoints</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };



  return (
    <DashboardContainer title="My Account" subtitle="Manage your personal orders, portfolio, and hired service pros.">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-xl">
        
        {/* Left Side: Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-md">
          <div className="border border-[#E9ECEF] rounded-2xl bg-white p-md space-y-xs text-left shadow-sm">
            <div className="px-sm py-xs border-b border-surface-variant mb-sm">
              <p className="text-[10px] font-bold text-secondary font-label-caps uppercase tracking-wider">Account Navigation</p>
            </div>
            {[
              { id: 'overview', label: 'Overview', icon: 'dashboard' },
              { id: 'orders', label: 'Orders History', icon: 'shopping_bag' },
              { id: 'services', label: 'Hired Services', icon: 'handshake' },
              ...(user?.role && ['Business', 'Contractor', 'Supplier'].includes(user.role) ? [
                { id: 'rfqs', label: 'My RFQs', icon: 'receipt_long' }
              ] : []),
              { id: 'saved', label: 'Saved Items', icon: 'bookmark' },
              { id: 'payment', label: 'Payment Methods', icon: 'credit_card' },
              { id: 'rewards', label: 'BuildPoints Rewards', icon: 'stars' },
              { id: 'settings', label: 'Profile Settings', icon: 'settings' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full text-left px-md py-sm rounded-xl text-body-sm font-semibold transition-all flex items-center gap-sm select-none ${
                  activeTab === t.id
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-secondary hover:bg-background hover:text-[#0A0A0A]'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Tab Content */}
        <div className="lg:col-span-3 space-y-xl">
          {activeTab === 'overview' && renderOverview()}

          {activeTab === 'order-detail' && renderOrderDetail()}
          
          {activeTab === 'orders' && (
            <div className="space-y-md">
              {/* Metrics Header */}
              <div className="flex justify-between items-center bg-[#F8F9FA] p-md rounded-2xl border border-[#E9ECEF] text-left shadow-sm">
                <div>
                  <h3 className="font-bold text-[#0A0A0A] text-md">Orders History</h3>
                  <p className="text-secondary text-xs">{getOrdersSubtitle()}</p>
                </div>
                <button
                  onClick={() => setShowRepeatOrderModal(true)}
                  className="px-md py-1.5 bg-[#FFC107] text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded-lg text-xs transition-colors flex items-center gap-xs shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  Quick Repeat
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col md:flex-row gap-sm justify-between items-stretch md:items-center bg-[#F8F9FA] p-sm rounded-xl border border-[#E9ECEF]">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined text-secondary absolute left-sm top-1/2 -translate-y-1/2 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search order ID or product..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-8 pr-sm py-1.5 rounded-lg border border-[#E9ECEF] bg-white text-xs text-[#0A0A0A] placeholder:text-secondary outline-none focus:border-[#FFC107] focus:ring-0"
                  />
                </div>
                <div className="flex items-center gap-xs">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wide">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="py-1.5 px-md rounded-lg border border-[#E9ECEF] bg-white text-xs text-[#0A0A0A] focus:border-[#FFC107] focus:ring-0 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Out For Delivery">Out For Delivery</option>
                    <option value="Awaiting Delivery">Awaiting Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Orders List */}
              <div className="border border-[#E9ECEF] rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[10px] font-bold text-secondary uppercase tracking-wider">
                      <th className="p-md">Order Info</th>
                      <th className="p-md">Products</th>
                      <th className="p-md">Status</th>
                      <th className="p-md">Amount</th>
                      <th className="p-md text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9ECEF] text-xs">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-lg text-center text-secondary">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                          <td className="p-md font-semibold text-[#0A0A0A]">
                            <button
                              onClick={() => viewOrderDetail(order.id)}
                              className="font-bold text-sm text-[#FFC107] hover:underline text-left outline-none block"
                            >
                              {order.id}
                            </button>
                            <div className="text-secondary text-[11px] font-normal">{order.date}</div>
                          </td>
                          <td className="p-md text-secondary max-w-[280px] truncate" title={order.products}>
                            {order.products}
                          </td>
                          <td className="p-md">
                            <span className={`inline-block px-sm py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              order.status === 'Out For Delivery'
                                ? 'bg-green-100 text-green-800'
                                : order.status === 'Awaiting Delivery'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-md font-bold text-[#0A0A0A]">{order.amount}</td>
                          <td className="p-md text-right">
                            <button
                              onClick={() => downloadInvoice(order)}
                              className="inline-flex items-center gap-xs px-md py-1.5 bg-[#F8F9FA] border border-[#E9ECEF] hover:bg-[#FFC107] hover:border-[#FFC107] hover:text-[#0A0A0A] text-secondary font-bold rounded-lg transition-all text-xs"
                            >
                              <span className="material-symbols-outlined text-[16px]">download</span>
                              Invoice
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-md">
              {/* Metrics Header */}
              <div className="bg-[#F8F9FA] p-md rounded-2xl border border-[#E9ECEF] text-left shadow-sm">
                <h3 className="font-bold text-[#0A0A0A] text-md">Hired Professional Services</h3>
                <p className="text-secondary text-xs">{getServicesSubtitle()}</p>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col md:flex-row gap-sm justify-between items-stretch md:items-center bg-[#F8F9FA] p-sm rounded-xl border border-[#E9ECEF]">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined text-secondary absolute left-sm top-1/2 -translate-y-1/2 text-[18px]">search</span>
                  <input
                    type="text"
                    placeholder="Search service name or provider..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    className="w-full pl-8 pr-sm py-1.5 rounded-lg border border-[#E9ECEF] bg-white text-xs text-[#0A0A0A] placeholder:text-secondary outline-none focus:border-[#FFC107] focus:ring-0"
                  />
                </div>
                <div className="flex items-center gap-xs">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wide">Status:</span>
                  <select
                    value={serviceStatusFilter}
                    onChange={(e) => setServiceStatusFilter(e.target.value)}
                    className="py-1.5 px-md rounded-lg border border-[#E9ECEF] bg-white text-xs text-[#0A0A0A] focus:border-[#FFC107] focus:ring-0 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Services List */}
              <div className="border border-[#E9ECEF] rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E9ECEF] text-[10px] font-bold text-secondary uppercase tracking-wider">
                      <th className="p-md">Booking Info</th>
                      <th className="p-md">Service Details</th>
                      <th className="p-md">Provider</th>
                      <th className="p-md">Status</th>
                      <th className="p-md text-right">Estimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9ECEF] text-xs">
                    {filteredServices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-lg text-center text-secondary">
                          No services found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredServices.map((service) => (
                        <tr key={service.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                          <td className="p-md font-semibold text-[#0A0A0A]">
                            <div className="font-bold text-sm">{service.id}</div>
                            <div className="text-secondary text-[11px] font-normal">{service.date}</div>
                          </td>
                          <td className="p-md font-bold text-[#0A0A0A] max-w-[240px] truncate" title={service.serviceName}>
                            {service.serviceName}
                          </td>
                          <td className="p-md text-secondary font-medium">{service.provider}</td>
                          <td className="p-md">
                            <span className={`inline-block px-sm py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              service.status === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {service.status}
                            </span>
                          </td>
                          <td className="p-md text-right font-bold text-[#0A0A0A]">{service.amount}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rfqs' && renderRfqs()}
          {activeTab === 'saved' && renderSaved()}
          {activeTab === 'payment' && renderPayment()}
          {activeTab === 'rewards' && renderRewards()}
          {activeTab === 'settings' && renderSettings()}
        </div>

      </div>

      {/* Repeat Order Modal Overlay */}
      {showRepeatOrderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-md z-[100] animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E9ECEF] overflow-hidden">
            {/* Header */}
            <div className="p-lg border-b border-[#E9ECEF] flex justify-between items-center bg-[#F8F9FA]">
              <div>
                <h2 className="font-bold text-[#0A0A0A] text-lg flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[#FFC107]">replay</span>
                  Quick Repeat Order
                </h2>
                <p className="text-secondary text-xs mt-0.5">Quickly reorder materials from your past delivered purchases.</p>
              </div>
              <button
                onClick={() => setShowRepeatOrderModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-secondary hover:bg-[#E9ECEF] hover:text-[#0A0A0A] transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-lg overflow-y-auto space-y-md flex-1">
              {repeatToast && (
                <div className="bg-green-50 border border-green-200 text-green-800 text-xs p-sm rounded-xl font-bold flex items-center gap-xs animate-slideDown mb-sm">
                  <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                  {repeatToast}
                </div>
              )}
              
              <div className="border border-[#E9ECEF] rounded-2xl p-md bg-[#F8F9FA]/50 space-y-sm">
                <div className="flex justify-between items-center border-b border-[#E9ECEF] pb-xs">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">Previous Order #ARC-91820</span>
                  <span className="text-[11px] text-secondary font-medium">Delivered on June 10, 2026</span>
                </div>
                
                <div className="flex justify-between items-center py-xs">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#0A0A0A]">Jaquar Basin Mixer</p>
                    <p className="text-[11px] text-secondary">Qty: 2 • ₹3,450 / Unit</p>
                  </div>
                  <div className="text-right flex items-center gap-md">
                    <p className="text-xs font-bold text-[#0A0A0A] mr-sm">₹6,900</p>
                    <button
                      onClick={() => handleReorder('Jaquar Basin Mixer', 2)}
                      className="px-md py-1.5 bg-[#FFC107] text-[#0A0A0A] hover:bg-[#fabd00] font-bold rounded-lg text-xs transition-colors flex items-center gap-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer title="Business Dashboard" subtitle="Track corporate orders, tax invoice savings, and commercial RFQs.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        
        {/* Core Stats */}
        <div className="lg:col-span-2 space-y-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-[#FFFDF5] border border-[#FFC107]/20 p-md rounded-2xl">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px]">percent</span>
              <p className="text-[24px] font-bold text-[#FFC107] mt-2">₹12,450</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">GST Savings Input</p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-md rounded-2xl">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px]">assignment</span>
              <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">3 Submissions</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Active B2B RFQs</p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-md rounded-2xl">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px]">analytics</span>
              <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">₹1,82,000</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Annual Spend</p>
            </div>
          </div>

          {/* Active RFQs */}
          <div className="border border-[#E9ECEF] rounded-2xl p-lg space-y-md">
            <h3 className="font-bold text-[#0A0A0A] text-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">receipt_long</span> Recent RFQs
            </h3>
            <div className="border border-[#E9ECEF] rounded-xl p-md flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
              <div>
                <p className="text-xs font-bold text-[#0A0A0A]">RFQ #RFQ-992</p>
                <p className="text-[11px] text-secondary">Plumbing Materials (CPVC pipes, fittings) • 500 units</p>
              </div>
              <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-sm py-xs rounded-full uppercase tracking-wider">
                Pending Quotes
              </div>
              <p className="text-xs font-bold text-secondary">Awaiting responses</p>
            </div>
          </div>
        </div>

        {/* Business Sidebar */}
        <div className="space-y-lg">
          <div className="border border-[#E9ECEF] rounded-2xl p-lg space-y-md text-left">
            <h3 className="font-bold text-[#0A0A0A] text-sm">Company Corporate Profile</h3>
            <div className="space-y-xs text-xs">
              <p className="font-bold text-body-xs">{user?.companyName || 'Corporate Entity'}</p>
              {user?.gstNumber && <p><span className="font-bold text-secondary font-semibold">GSTIN:</span> {user.gstNumber}</p>}
              <p><span className="font-bold text-secondary">Authorized contact:</span> {user?.name}</p>
              <p><span className="font-bold text-secondary">Contact Email:</span> {user?.email}</p>
              <p><span className="font-bold text-secondary">Contact Phone:</span> {user?.phone}</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardContainer>
  );
};

export const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardContainer title="Professional Dashboard" subtitle="Manage project leads, send quotes, and update your catalog listings.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        
        {/* Core Stats */}
        <div className="lg:col-span-2 space-y-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-[#FFFDF5] border border-[#FFC107]/20 p-md rounded-2xl">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px]">campaign</span>
              <p className="text-[24px] font-bold text-[#FFC107] mt-2">12 Active</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Localized Leads</p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-md rounded-2xl">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px]">done_all</span>
              <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">18 Projects</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Completed Tasks</p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-md rounded-2xl">
              <span className="material-symbols-outlined text-[#FFC107] text-[32px]">star</span>
              <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">4.9 / 5</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Client Rating</p>
            </div>
          </div>

          {/* Leads Panel */}
          <div className="border border-[#E9ECEF] rounded-2xl p-lg space-y-md">
            <h3 className="font-bold text-[#0A0A0A] text-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-sm">explore</span> Incoming Leads
            </h3>
            <div className="border border-[#E9ECEF] rounded-xl p-md flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
              <div>
                <p className="text-xs font-bold text-[#0A0A0A]">Bathroom Renovation &amp; Leakage</p>
                <p className="text-[11px] text-secondary">Whitefield, Bangalore • Requested 2 hours ago</p>
              </div>
              <button
                type="button"
                className="py-1.5 px-md bg-[#FFC107] text-[#0A0A0A] font-bold rounded-lg text-xs hover:bg-[#fabd00]"
                onClick={() => alert('Simulator: Lead detail viewer launches.')}
              >
                Submit Quote
              </button>
            </div>
          </div>
        </div>

        {/* Pro Profile Sidebar */}
        <div className="space-y-lg">
          <div className="border border-[#E9ECEF] rounded-2xl p-lg space-y-md text-left">
            <h3 className="font-bold text-[#0A0A0A] text-sm">Professional details</h3>
            <div className="space-y-xs text-xs">
              <p><span className="font-bold text-secondary">Business Name:</span> {user?.companyName}</p>
              {user?.serviceCategory && <p><span className="font-bold text-secondary">Specialization:</span> {user.serviceCategory}</p>}
              {user?.experience && <p><span className="font-bold text-secondary">Experience:</span> {user.experience} Years</p>}
              {user?.city && <p><span className="font-bold text-secondary">Region:</span> {user.city}, {user.state}</p>}
              {user?.website && <p><span className="font-bold text-secondary">Website:</span> <a href={user.website} className="text-[#FFC107] hover:underline" target="_blank" rel="noopener noreferrer">{user.website}</a></p>}
            </div>
          </div>
        </div>

      </div>
    </DashboardContainer>
  );
};

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardContainer title="Admin Dashboard" subtitle="Global ARCUS controls, system logs, users count and verification metrics.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        
        {/* Core Stats */}
        <div className="lg:col-span-2 space-y-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-md rounded-2xl">
              <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">14,281</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Total Users</p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-md rounded-2xl">
              <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">498</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Active Suppliers</p>
            </div>
            <div className="bg-[#F8F9FA] border border-[#E9ECEF] p-md rounded-2xl">
              <p className="text-[24px] font-bold text-[#0A0A0A] mt-2">1,248</p>
              <p className="text-xs text-secondary font-semibold font-label-caps uppercase tracking-wide">Quotations Executed</p>
            </div>
          </div>

          {/* Logs */}
          <div className="border border-[#E9ECEF] rounded-2xl p-lg space-y-md text-left">
            <h3 className="font-bold text-[#0A0A0A] text-sm">System Logs</h3>
            <div className="bg-[#0A0A0A] text-green-500 font-mono text-xs rounded-xl p-md h-32 overflow-y-auto space-y-1">
              <p>[INFO] 2026-06-17 18:03:15 - Database connections pool established.</p>
              <p>[INFO] 2026-06-17 18:03:18 - Verified SSL configuration certificates.</p>
              <p>[WARN] 2026-06-17 18:03:22 - GST Lookup response time delayed from external API (240ms).</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-lg">
          <div className="border border-[#E9ECEF] rounded-2xl p-lg space-y-md text-left">
            <h3 className="font-bold text-[#0A0A0A] text-sm">System Status</h3>
            <ul className="space-y-2 text-xs font-semibold text-secondary">
              <li className="flex items-center justify-between">
                <span>Database</span>
                <span className="text-green-600">ONLINE</span>
              </li>
              <li className="flex items-center justify-between">
                <span>GST API</span>
                <span className="text-green-600">ACTIVE</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Server Health</span>
                <span className="text-green-600">100%</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </DashboardContainer>
  );
};

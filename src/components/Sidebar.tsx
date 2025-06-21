// src/components/Sidebar.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Lucide React Icons
import {
  Calendar,
  BookOpen,
  Bot,
  Repeat,
  Warehouse,
  Users,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  BarChart,
  Package,
  Activity,
  Gauge,
  MapPin,
  SquareGanttChart,
  Table,
  Zap,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

// --- MOCK useAuth HOOK ---
const useAuth = () => {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const logout = useCallback(() => {
    console.log('Mock logout called.');
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demoUser');
    }
    alert('Çıkış yapıldı! (Mock)');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !user) {
      const loggedInUser = localStorage.getItem('demoUser');
      if (loggedInUser) {
        setUser(JSON.parse(loggedInUser));
      }
    }
  }, [user]);

  return { user, logout };
};

// Navigasyon Link Yapısı
interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | null;
  category?: string;
  segmentId?: string;
}

const navLinks: NavLink[] = [
  { href: '/pmp', label: 'Dashboard', icon: Zap, category: 'Ana Sayfalar' },
  { href: '/racks', label: 'Envanter', icon: Package, category: 'Envanter' },
  { href: '/reports', label: 'Raporlar', icon: BarChart, category: 'Analiz' },
  { href: '/SanalHat', label: 'Hat', icon: Package, category: 'Analiz' },
  { href: '/calendar', label: 'Takvim', icon: Calendar, category: 'Genel' },
  { href: '/guidelist', label: 'Rehber', icon: BookOpen, category: 'Genel' },
  { href: '/asistan', label: 'Asistan', icon: Bot, category: 'Genel' },
  { href: '/anomal', label: 'Döngü', icon: Repeat, badge: 'NEW', category: 'Analiz' },
  { href: '/Depo', label: 'Depo', icon: Warehouse, category: 'Envanter' },
  { href: '/squad', label: 'Ekip', icon: Users, category: 'Yönetim' },
  {
    href: '/pmp#sim-controls',
    label: 'Sim Kontrolleri',
    icon: Activity,
    segmentId: 'sim-controls',
    category: 'Simülasyon Detayları',
  },
  {
    href: '/pmp#status-cards',
    label: 'Anlık Durum Kartları',
    icon: Gauge,
    segmentId: 'status-cards',
    category: 'Simülasyon Detayları',
  },
  {
    href: '/pmp#raw-data',
    label: 'Ham Veriler',
    icon: Table,
    segmentId: 'raw-data',
    category: 'Simülasyon Detayları',
  },
  {
    href: '/pmp#bus-map',
    label: 'Harita Konumu',
    icon: MapPin,
    segmentId: 'bus-map',
    category: 'Simülasyon Detayları',
  },
  {
    href: '/pmp#charts',
    label: 'Grafikler',
    icon: SquareGanttChart,
    segmentId: 'charts',
    category: 'Simülasyon Detayları',
  },
];

// Enhanced NavLinkItem with better animations and styling
interface NavLinkItemProps {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | null;
  isActive: boolean;
  isCollapsed: boolean;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavLinkItem: React.FC<NavLinkItemProps> = React.memo(
  ({ href, label, icon: Icon, badge, isActive, isCollapsed, onClick }) => (
    <motion.div
      layout
      initial={false}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative group"
    >
      <Link
        href={href}
        className={clsx(
          'relative flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 overflow-hidden',
          'text-slate-300 hover:text-white',
          isActive
            ? 'bg-gradient-to-r from-blue-600/90 to-indigo-600/90 text-white shadow-lg shadow-blue-500/25 border border-blue-400/30'
            : 'hover:bg-slate-800/60 hover:shadow-lg hover:shadow-slate-900/20',
          'focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
          isCollapsed && 'justify-center w-12 h-12 p-0',
        )}
        tabIndex={0}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        title={isCollapsed ? label : undefined}
      >
        {/* Background glow effect for active item */}
        {isActive && (
          <motion.div
            layoutId="active-bg"
            className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl"
            initial={false}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
          />
        )}

        {/* Icon with enhanced animations */}
        <motion.span
          className={clsx('flex-shrink-0 relative z-10', isCollapsed ? 'w-6 h-6' : 'w-5 h-5')}
          initial={false}
          animate={{
            scale: isActive ? 1.1 : 1,
            rotate: isActive ? [0, -10, 10, 0] : 0,
          }}
          transition={{
            scale: { type: 'spring', stiffness: 500, damping: 30 },
            rotate: { duration: 0.6, times: [0, 0.3, 0.7, 1] },
          }}
        >
          <Icon className="w-full h-full" />
          {isActive && (
            <motion.div
              className="absolute -inset-1 bg-blue-400/20 rounded-full blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.span>

        {/* Label with slide animation */}
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 whitespace-nowrap font-semibold"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge with enhanced styling */}
        {badge && !isCollapsed && (
          <motion.span
            className={clsx(
              'ml-auto text-xs px-2.5 py-1 rounded-full font-bold relative z-10 shadow-sm',
              badge === 'NEW' && 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
              badge === 'LIVE' &&
                'bg-gradient-to-r from-red-500 to-pink-600 text-white animate-pulse',
            )}
            initial={{ opacity: 0, scale: 0.8, x: 5 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
          >
            {badge}
            {badge === 'NEW' && (
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.span>
        )}

        {/* Hover effect border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-slate-600/0 group-hover:border-slate-600/50 transition-colors duration-300"
          initial={false}
        />
      </Link>

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 0, x: -10, scale: 0.9 }}
            whileHover={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-xl border border-slate-700/50 whitespace-nowrap z-50 pointer-events-none"
          >
            {label}
            {badge && (
              <span
                className={clsx(
                  'ml-2 text-xs px-1.5 py-0.5 rounded font-bold',
                  badge === 'NEW' && 'bg-emerald-500 text-white',
                  badge === 'LIVE' && 'bg-red-500 text-white',
                )}
              >
                {badge}
              </span>
            )}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700/50" />
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  ),
);
NavLinkItem.displayName = 'NavLinkItem';

// Enhanced User Auth Button
interface UserAuthButtonProps {
  user: { name: string; role: string } | null;
  logout: () => void;
  onCloseMenu?: () => void;
  isCollapsed?: boolean;
}

const UserAuthButton: React.FC<UserAuthButtonProps> = ({
  user,
  logout,
  onCloseMenu,
  isCollapsed,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, handleClickOutside]);

  const handleLogout = useCallback(() => {
    logout();
    setDropdownOpen(false);
    onCloseMenu?.();
  }, [logout, onCloseMenu]);

  return (
    <div className="relative" ref={dropdownRef}>
      {user ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={clsx(
            'flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 text-white font-medium shadow-lg border border-slate-600/50 hover:from-slate-700/80 hover:to-slate-600/80 transition-all duration-300 backdrop-blur-sm',
            'focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
            isCollapsed ? 'justify-center w-12 h-12 p-0' : 'w-full',
          )}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          aria-label={isCollapsed ? 'Kullanıcı Menüsü' : `Kullanıcı Menüsü: ${user.name}`}
        >
          <motion.span
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex-shrink-0 shadow-lg border-2 border-blue-400/30"
            animate={{ rotate: dropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {user.name.charAt(0).toUpperCase()}
          </motion.span>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col items-start min-w-0 flex-1"
              >
                <span className="text-sm font-semibold truncate w-full text-left">{user.name}</span>
                <span className="text-xs text-slate-400 truncate w-full text-left">
                  {user.role}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCollapsed && (
            <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          )}
        </motion.button>
      ) : (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/auth/Login"
            className={clsx(
              'flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-xl border-2 border-emerald-400/30 text-white transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-slate-900',
              isCollapsed ? 'mx-auto' : '',
            )}
            tabIndex={0}
            aria-label="Giriş Yap"
            onClick={onCloseMenu}
          >
            <User className="w-6 h-6" />
          </Link>
        </motion.div>
      )}
      <AnimatePresence>
        {dropdownOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 400 }}
            className={clsx(
              'absolute mt-3 w-56 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-600/50',
              isCollapsed ? 'left-full ml-3 bottom-0' : 'right-0 bottom-full mb-2',
            )}
          >
            <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{user.name}</p>
                  <p className="text-sm text-slate-400 truncate">{user.role}</p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ backgroundColor: 'rgb(51, 65, 85)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
UserAuthButton.displayName = 'UserAuthButton';

// Main Sidebar Component
interface SidebarProps {
  onStateChange: (newWidth: string, isMobileMenuOpen: boolean) => void;
}

export default function Sidebar({ onStateChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Group navigation links by category
  const groupedLinks = navLinks.reduce(
    (acc, link) => {
      const category = link.category || 'Diğer';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(link);
      return acc;
    },
    {} as Record<string, NavLink[]>,
  );

  // Close mobile menu on outside click
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  // Report sidebar state to parent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentWidth = isOpen
        ? '256px'
        : window.innerWidth < 1024
          ? '0px'
          : isCollapsed
            ? '80px'
            : '256px';
      onStateChange(currentWidth, isOpen);
    }
  }, [isOpen, isCollapsed, onStateChange]);

  const handleNavLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      setIsOpen(false);
      if (typeof window !== 'undefined' && event.currentTarget.pathname === pathname) {
        const targetId = event.currentTarget.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          event.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [pathname],
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 text-white shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
      >
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.div>
      </motion.button>

      {/* Sidebar */}
      <motion.nav
        ref={sidebarRef}
        initial={false}
        animate={
          typeof window !== 'undefined' && window.innerWidth < 1024
            ? isOpen
              ? 'open'
              : 'closed'
            : isCollapsed
              ? 'collapsed'
              : 'open'
        }
        variants={{
          open: {
            x: 0,
            width: 256,
            transition: { type: 'spring', stiffness: 400, damping: 40 },
          },
          collapsed: {
            x: 0,
            width: 80,
            transition: { type: 'spring', stiffness: 400, damping: 40 },
          },
          closed: {
            x: '-100%',
            width: 256,
            transition: { type: 'spring', stiffness: 400, damping: 40 },
          },
        }}
        className={clsx(
          'fixed top-0 left-0 h-full z-40 flex flex-col',
          'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95',
          'backdrop-blur-xl border-r border-slate-700/50',
          'shadow-2xl shadow-slate-900/50',
          isOpen ? '' : 'hidden lg:flex',
        )}
      >
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 via-transparent to-indigo-900/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-6">
          {/* Logo and Title */}
          <motion.div whileHover={{ scale: 1.02 }} className="mb-8 flex-shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-2xl p-2 -m-2"
              aria-label="Ana Sayfaya Git"
              onClick={() => setIsOpen(false)}
            >
              <motion.span
                className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-xl border-2 border-blue-400/30 flex-shrink-0 relative overflow-hidden"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <Sparkles className="w-7 h-7 text-white relative z-10" />
              </motion.span>
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
                    className="flex flex-col"
                  >
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                      R&D Dashboard
                    </span>
                    <span className="text-xs text-slate-400 font-medium tracking-wide">
                      Advanced Analytics
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
            <motion.div
              variants={{
                open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                collapsed: { transition: { staggerChildren: 0.03 } },
                closed: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
              }}
              className="space-y-6"
            >
              {Object.keys(groupedLinks).map((category, categoryIndex) => (
                <motion.div
                  key={category}
                  variants={{
                    open: { opacity: 1, y: 0 },
                    collapsed: { opacity: 1, y: 0 },
                    closed: { opacity: 0, y: 20 },
                  }}
                  className="space-y-2"
                >
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.h3
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: categoryIndex * 0.05 }}
                        className="text-slate-400 text-xs font-bold uppercase tracking-wider px-2 mb-3 flex items-center gap-2"
                      >
                        <div className="w-1 h-1 bg-slate-500 rounded-full" />
                        {category}
                      </motion.h3>
                    )}
                  </AnimatePresence>
                  <div className="space-y-1">
                    {groupedLinks[category].map((link) => {
                      const isLinkActive = Boolean(
                        pathname === link.href ||
                          (link.segmentId &&
                            pathname.startsWith(link.href.split('#')[0]) &&
                            (typeof window !== 'undefined' ? window.location.hash : '') ===
                              `#${link.segmentId}`),
                      );

                      return (
                        <NavLinkItem
                          key={link.href}
                          href={link.href}
                          label={link.label}
                          icon={link.icon}
                          badge={link.badge}
                          isActive={isLinkActive}
                          isCollapsed={isCollapsed}
                          onClick={handleNavLinkClick}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* User Auth Section */}
          <motion.div
            className="mt-6 pt-6 border-t border-slate-700/50 flex-shrink-0"
            variants={{
              open: { opacity: 1, y: 0 },
              collapsed: { opacity: 1, y: 0 },
              closed: { opacity: 0, y: 20 },
            }}
          >
            <UserAuthButton
              user={user}
              logout={logout}
              onCloseMenu={() => setIsOpen(false)}
              isCollapsed={isCollapsed}
            />
          </motion.div>
        </div>

        {/* Desktop Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgb(51, 65, 85)' }}
          whileTap={{ scale: 0.9 }}
          className="hidden lg:flex absolute -right-4 top-8 p-2 bg-slate-800/90 backdrop-blur-xl rounded-full border border-slate-600/50 text-white shadow-xl z-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Sidebarı Genişlet' : 'Sidebarı Daralt'}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </motion.nav>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

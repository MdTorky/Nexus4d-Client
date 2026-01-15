import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
// import { cn } from '../ui/Button';
import { useNotifications } from '../../context/NotificationContext';

const NAV_LINKS = [
    { label: 'nav.home', path: '/' },
    { label: 'nav.courses', path: '/courses' },
    { label: 'nav.about', path: '/about' },
    { label: 'nav.contact', path: '/contact' },
    { label: 'nav.becomeTutor', path: '/tutor-application' },
];

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const location = useLocation();
    const { showToast } = useToast();

    // Refs for click outside handling
    const langRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
        setIsAvatarOpen(false);
        setIsLangOpen(false);
        setIsNotifOpen(false);
    }, [location.pathname]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(event.target as Node)) setIsLangOpen(false);
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsAvatarOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsLangOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60 shadow-lg shadow-nexus-green/5">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-10">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-nexus-green blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <img src="/Logo Horizontal.png" alt="Nexus 4D" className="w-32 object-contain relative z-10" />
                            </div>
                        </Link>
                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-8">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative text-xs font-black uppercase tracking-widest transition-all duration-300 hover:text-nexus-green group ${isActive(link.path) ? 'text-nexus-green' : 'text-gray-400'
                                        }`}
                                >
                                    {t(link.label)}
                                    <span className={`absolute -bottom-[29px] left-0 h-[3px] w-full bg-nexus-green transform origin-left transition-transform duration-300 ${isActive(link.path) ? 'scale-x-100 shadow-[0_0_10px_#22c55e]' : 'scale-x-0 group-hover:scale-x-100'
                                        }`} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Language, Auth, Mobile Menu */}
                    <div className="flex items-center gap-4">

                        {/* Language Switcher */}
                        <div className="relative" ref={langRef}>
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${isLangOpen
                                    ? 'border-nexus-green bg-nexus-green/10 text-nexus-green shadow-[0_0_10px_rgba(34,197,94,0.3)]'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                                    }`}
                            >
                                <Icon icon="mdi:web" className="h-4 w-4" />
                                <span>{i18n.language.toUpperCase()}</span>
                            </button>
                            <AnimatePresence>
                                {isLangOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute right-0 mt-4 w-40 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50"
                                    >
                                        <div className="p-2 space-y-1">
                                            {[
                                                { code: 'en', label: 'English', icon: 'emojione:flag-for-united-kingdom' },
                                                { code: 'ar', label: 'العربية', icon: 'emojione:flag-for-saudi-arabia' }
                                            ].map((lang) => (
                                                <button
                                                    key={lang.code}
                                                    onClick={() => changeLanguage(lang.code)}
                                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${i18n.language === lang.code
                                                        ? 'bg-nexus-green text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                                                        : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <Icon icon={lang.icon} className="text-base" />
                                                        {lang.label}
                                                    </span>
                                                    {i18n.language === lang.code && <Icon icon="mdi:check-circle" />}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                                        className={`relative rounded-full p-2.5 transition-all group ${isNotifOpen
                                            ? 'bg-nexus-green/20 text-nexus-green'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                                        )}
                                        <Icon icon={unreadCount > 0 ? "mdi:bell-ring" : "mdi:bell-outline"} className="h-5 w-5" />
                                    </button>

                                    <AnimatePresence>
                                        {isNotifOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                className="absolute right-0 mt-4 w-96 rounded-3xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/5"
                                            >
                                                {/* Header */}
                                                <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                                    <div className="flex items-center gap-2">
                                                        <Icon icon="mdi:access-point-network" className="text-nexus-green" />
                                                        <h3 className="font-black text-white uppercase tracking-wider text-sm">{t('nav.notifications.title')}</h3>
                                                    </div>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-[10px] font-bold text-nexus-green hover:text-white uppercase tracking-widest bg-nexus-green/10 hover:bg-nexus-green/20 px-3 py-1 rounded-full transition-colors border border-nexus-green/20"
                                                        >
                                                            {t('nav.notifications.markAll')}
                                                        </button>
                                                    )}
                                                </div>

                                                {/* List */}
                                                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                                                    {notifications.length === 0 ? (
                                                        <div className="py-12 flex flex-col items-center text-center opacity-50">
                                                            <Icon icon="mdi:bell-sleep-outline" className="text-4xl text-gray-500 mb-2" />
                                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wide">{t('nav.notifications.empty')}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {notifications.map((notif) => (
                                                                <motion.div
                                                                    key={notif._id}
                                                                    layout
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    className={`p-4 rounded-xl border border-transparent transition-all cursor-pointer relative overflow-hidden group ${!notif.is_read
                                                                        ? 'bg-nexus-green/5 border-l-nexus-green border-l-2'
                                                                        : 'hover:bg-white/5 hover:border-white/5'
                                                                        }`}
                                                                    onClick={() => markAsRead(notif._id)}
                                                                >
                                                                    <div className="flex gap-4 items-start relative z-10">
                                                                        <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${notif.type === 'success' ? 'bg-green-500/20 text-green-500' :
                                                                            notif.type === 'error' ? 'bg-red-500/20 text-red-500' :
                                                                                notif.type === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                                                                                    'bg-blue-500/20 text-blue-500'
                                                                            }`}>
                                                                            <Icon icon={
                                                                                notif.type === 'success' ? 'mdi:check-circle' :
                                                                                    notif.type === 'error' ? 'mdi:alert-circle' :
                                                                                        notif.type === 'warning' ? 'mdi:alert' : 'mdi:information'
                                                                            } className="text-lg" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={`text-sm font-bold ${!notif.is_read ? 'text-white' : 'text-gray-400'} mb-0.5`}>
                                                                                {notif.title}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                                                {notif.message}
                                                                            </p>
                                                                            <p className="text-[9px] text-gray-600 font-mono mt-2 uppercase tracking-wide">
                                                                                {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </p>
                                                                        </div>
                                                                        {!notif.is_read && (
                                                                            <div className="h-2 w-2 rounded-full bg-nexus-green shadow-[0_0_5px_#22c55e]" />
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* User Dropdown (Avatar) */}
                                <div className="relative hidden md:block" ref={profileRef}>
                                    <button
                                        onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                                        className={`flex items-center gap-3 rounded-full border pl-1 pr-5 py-1 transition-all group overflow-hidden ${isAvatarOpen
                                            ? 'border-nexus-green bg-nexus-green/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-black relative">
                                            <img
                                                src={user.current_avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                                alt="User"
                                                className="h-full w-full object-cover p-1"
                                            />
                                            {/* Online Status Dot */}
                                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-nexus-green rounded-full border-2 border-black" />
                                        </div>
                                        <div className="text-left flex flex-col">
                                            <span className={`text-xs font-black uppercase tracking-wider ${isAvatarOpen ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                {user.first_name || user.username}
                                            </span>
                                            <span className="text-[9px] text-nexus-green font-bold tracking-widest uppercase">
                                                {t('nav.user.level')} {user.level || 1}
                                            </span>
                                        </div>
                                        <Icon
                                            icon="mdi:chevron-down"
                                            className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isAvatarOpen ? 'rotate-180 text-nexus-green' : ''}`}
                                        />
                                    </button>

                                    <AnimatePresence>
                                        {isAvatarOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute right-0 mt-4 w-72 rounded-3xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-white/5"
                                            >
                                                {/* Mini Profile Header */}
                                                <div className="p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5 text-center relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-nexus-green to-purple-500" />

                                                    <div className="w-20 h-20 mx-auto rounded-full p-1 bg-gradient-to-br from-nexus-green to-blue-500 mb-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                                        <img
                                                            src={user.current_avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                                            alt="User"
                                                            className="h-full w-full object-cover rounded-full border-2 border-black p-1"
                                                        />
                                                    </div>
                                                    <h3 className="text-white font-black uppercase tracking-tight text-lg">{user.username}</h3>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">{user.role}</p>

                                                    {/* XP Bar */}
                                                    <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-white/10 relative">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-nexus-green to-blue-500"
                                                            style={{ width: `${Math.min(100, ((user?.xp_points || 0) % 500) / 5)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between mt-1 text-[9px] font-mono text-gray-500">
                                                        <span>{t('nav.user.xp')}: {user.xp_points || 0}</span>
                                                        <span>{t('nav.user.nextLevel')}: {((user.level || 1) * 500)}</span>
                                                    </div>
                                                </div>

                                                {/* Actions Grid */}
                                                <div className="p-3 grid grid-cols-2 gap-2">
                                                    <Link to="/profile" onClick={() => setIsAvatarOpen(false)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-nexus-green/30 group">
                                                        <Icon icon="mdi:card-account-details" className="text-2xl text-gray-400 group-hover:text-nexus-green mb-1 transition-colors" />
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide group-hover:text-white">{t('common.profile')}</span>
                                                    </Link>
                                                    <Link to="/my-courses" onClick={() => setIsAvatarOpen(false)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-blue-500/30 group">
                                                        <Icon icon="mdi:school" className="text-2xl text-gray-400 group-hover:text-blue-500 mb-1 transition-colors" />
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wide group-hover:text-white">{t('common.myCourses')}</span>
                                                    </Link>
                                                    {user.role === 'admin' && (
                                                        <Link to="/admin" onClick={() => setIsAvatarOpen(false)} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 transition-colors border border-purple-500/20 hover:border-purple-500/50 group">
                                                            <Icon icon="eos-icons:admin" className="text-lg text-purple-500" />
                                                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wide group-hover:text-purple-300">{t('nav.user.adminCommand')}</span>
                                                        </Link>
                                                    )}
                                                    {user.role === 'tutor' && (
                                                        <Link to="/tutor-dashboard" onClick={() => setIsAvatarOpen(false)} className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20 hover:border-blue-500/50 group">
                                                            <Icon icon="mdi:view-dashboard" className="text-lg text-blue-500" />
                                                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide group-hover:text-blue-300">{t('nav.user.tutorDashboard')}</span>
                                                        </Link>
                                                    )}
                                                </div>

                                                {/* Logout */}
                                                <div className="p-3 border-t border-white/5">
                                                    <button
                                                        onClick={() => { logout(); setIsAvatarOpen(false); }}
                                                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors font-bold uppercase text-xs tracking-wider"
                                                    >
                                                        <Icon icon="mdi:logout" className="text-lg" />
                                                        {t('nav.user.disconnect')}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            // Auth Buttons
                            <div className="hidden md:flex gap-4">
                                <Link to="/login" className="text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors border border-transparent hover:border-white/10 hover:bg-white/5">
                                    {t('common.login')}
                                </Link>
                                <Link to="/register" className="rounded-xl bg-nexus-green text-black px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-nexus-green/90 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transform hover:-translate-y-0.5">
                                    {t('nav.joinNow')}
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                            <Icon icon={isMenuOpen ? "mdi:close" : "mdi:menu"} className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-white/10 bg-black/95 backdrop-blur-2xl overflow-hidden"
                    >
                        <div className="px-4 py-6 space-y-2">
                            {/* Mobile Links */}
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${isActive(link.path)
                                        ? 'bg-nexus-green/10 text-nexus-green border border-nexus-green/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t(link.label)}
                                </Link>
                            ))}

                            <div className="h-px bg-white/10 my-4" />

                            {user ? (
                                <div className="space-y-2">
                                    <div className="px-4 py-3 flex items-center gap-4 rounded-xl bg-white/5 border border-white/5 mb-4">
                                        <img
                                            src={user.current_avatar_url || user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                            alt="Avatar"
                                            className="h-12 w-12 rounded-full border border-black"
                                        />
                                        <div>
                                            <p className="text-white font-black uppercase tracking-tight">{user.username}</p>
                                            <p className="text-xs text-nexus-green font-bold">LVL {user.level || 1} • {user.xp_points || 0} XP</p>
                                        </div>
                                    </div>

                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-wider" onClick={() => setIsMenuOpen(false)}>
                                        <Icon icon="mdi:account" className="text-lg" />
                                        {t('common.profile')}
                                    </Link>
                                    <Link to="/my-courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-wider" onClick={() => setIsMenuOpen(false)}>
                                        <Icon icon="mdi:school" className="text-lg" />
                                        {t('common.myCourses')}
                                    </Link>

                                    <button
                                        onClick={() => { logout(); showToast('Logged out successfully!', 'success'); setIsMenuOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-bold text-xs uppercase tracking-wider mt-4"
                                    >
                                        <Icon icon="mdi:power" className="text-lg" />
                                        {t('common.logout')}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 pt-2">
                                    <Link to="/login" className="block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                        {t('common.login')}
                                    </Link>
                                    <Link to="/register" className="block w-full rounded-xl bg-nexus-green py-3 text-center text-xs font-black uppercase tracking-widest text-black hover:bg-nexus-green/90 transition-colors" onClick={() => setIsMenuOpen(false)}>
                                        {t('nav.joinNow')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
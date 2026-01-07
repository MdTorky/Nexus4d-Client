import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { cn } from '../ui/Button';
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
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(); // Hook
    const location = useLocation();
    const { showToast } = useToast();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAvatarOpen, setIsAvatarOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false); // Notification State

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMenuOpen(false); // Also close new mobile menu
    }, [location.pathname]);


    const isActive = (path: string) => location.pathname === path;

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsLangOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-nexus-card bg-black/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo & Desktop Nav */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/Logo Horizontal.png" alt="Nexus 4D" className="w-32 object-contain" />
                        </Link>
                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-6">
                            {/* ... existing links ... */}
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors hover:text-nexus-green ${location.pathname === link.path ? 'text-nexus-green' : 'text-gray-300'
                                        }`}
                                >
                                    {t(link.label)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Language, Auth, Mobile Menu */}
                    <div className="flex items-center gap-4">
                        {/* Language Switcher ... */}
                        {/* ... */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className="flex items-center gap-1 rounded-full border border-nexus-card bg-black/50 px-3 py-1.5 text-xs font-medium text-gray-300 hover:border-nexus-green hover:text-white transition-all"
                            >
                                <Icon icon="mdi:translate" className="h-4 w-4" />
                                <span>{i18n.language.toUpperCase()}</span>
                            </button>
                            {/* ... Dropdown ... */}
                            <AnimatePresence>
                                {isLangOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-32 rounded-xl border border-nexus-card bg-black shadow-xl"
                                    >
                                        <div className="p-1">
                                            <button onClick={() => changeLanguage('en')} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-nexus-green/10 hover:text-white">
                                                <span>English</span>
                                                {i18n.language === 'en' && <Icon icon="mdi:check" className="text-nexus-green" />}
                                            </button>
                                            <button onClick={() => changeLanguage('ar')} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-nexus-green/10 hover:text-white">
                                                <span>العربية</span>
                                                {i18n.language === 'ar' && <Icon icon="mdi:check" className="text-nexus-green" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {user ? (
                            <>
                                {/* Notification Bell */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                                        className="relative rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        <Icon icon="mdi:bell-outline" className="h-6 w-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isNotifOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl border border-nexus-card bg-nexus-black shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-nexus-card flex justify-between items-center bg-nexus-card/20">
                                                    <h3 className="font-semibold text-white">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <button
                                                            onClick={markAllAsRead}
                                                            className="text-xs text-nexus-green hover:underline"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="max-h-100 overflow-y-auto custom-scrollbar">
                                                    {notifications.length === 0 ? (
                                                        <div className="p-8 text-center text-gray-500 text-sm">
                                                            No notifications yet.
                                                        </div>
                                                    ) : (
                                                        notifications.map((notif) => (
                                                            <div
                                                                key={notif._id}
                                                                className={`p-4 border-b border-nexus-card/50 hover:bg-white/5 transition-colors cursor-pointer ${!notif.is_read ? 'bg-nexus-green/5' : ''}`}
                                                                onClick={() => markAsRead(notif._id)}
                                                            >
                                                                <div className="flex gap-3">
                                                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-nexus-green' : 'bg-transparent'}`} />
                                                                    <div className="flex-1">
                                                                        <p className={`text-sm font-medium ${notif.type === 'success' ? 'text-green-400' : notif.type === 'error' ? 'text-red-400' : 'text-white'}`}>
                                                                            {notif.title}
                                                                        </p>
                                                                        <p className="text-xs text-gray-400 mt-1">{notif.message}</p>
                                                                        <p className="text-[10px] text-gray-600 mt-2">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* User Dropdown (Avatar) */}
                                {/* ... existing avatar dropdown code ... */}
                                <div className="relative hidden md:block">
                                    <button
                                        onClick={() => setIsAvatarOpen(!isAvatarOpen)}
                                        className="flex items-center gap-3 rounded-full border border-transparent bg-nexus-card/30 pl-1 pr-4 py-1 hover:border-nexus-green transition-all"
                                    >
                                        <div className="h-8 w-8 overflow-hidden rounded-full bg-nexus-card">
                                            <img
                                                src={user.current_avatar_url || '/Icons/M Null Nexon.png'}
                                                alt="User"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-white max-w-25 truncate">{user.username}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <span>{t('profile.lvl')} {user.level || 1}</span>
                                                <span className="h-1 w-1 rounded-full bg-nexus-green"></span>
                                                <span>{user.xp_points || 0} {t('profile.xp')}</span>
                                            </div>
                                        </div>
                                        <Icon icon="mdi:chevron-down" className={`h-4 w-4 text-gray-400 transition-transform ${isAvatarOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* ... Avatar Dropdown ... */}
                                    <AnimatePresence>
                                        {isAvatarOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-56 rounded-xl border border-nexus-card bg-black shadow-xl"
                                            >
                                                <div className="p-2 space-y-1">
                                                    <Link to="/profile" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-nexus-green/10 hover:text-white" onClick={() => setIsAvatarOpen(false)}>
                                                        <Icon icon="mdi:account" className="text-nexus-green" />
                                                        <span>{t('common.profile')}</span>
                                                    </Link>
                                                    <Link to="/my-learning" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-nexus-green/10 hover:text-white" onClick={() => setIsAvatarOpen(false)}>
                                                        <Icon icon="mdi:school" className="text-nexus-green" />
                                                        <span>{t('common.myCourses')}</span>
                                                    </Link>
                                                    {user && user.role === 'admin' && (
                                                        <Link to="/admin" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-nexus-green/10 hover:text-white" onClick={() => setIsAvatarOpen(false)}>
                                                            <Icon icon="eos-icons:admin" className="text-nexus-green" />
                                                            <span>Admin Dashboard</span>
                                                        </Link>
                                                    )}
                                                    {user && (user.role === 'tutor' || user.role === 'admin') && (
                                                        <Link to="/tutor-dashboard" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-nexus-green/10 hover:text-white" onClick={() => setIsAvatarOpen(false)}>
                                                            <Icon icon="mdi:view-dashboard" className="text-nexus-green" />
                                                            <span>Tutor Dashboard</span>
                                                        </Link>
                                                    )}

                                                    <div className="my-1 h-px bg-nexus-card/50"></div>
                                                    <button onClick={() => { logout(); setIsAvatarOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 hover:text-red-400">
                                                        <Icon icon="mdi:logout" />
                                                        <span>{t('common.logout')}</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            // ... Auth Buttons ...
                            <div className="hidden md:flex gap-4">
                                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors py-2">{t('common.login')}</Link>
                                <Link to="/register" className="rounded-full bg-nexus-green px-6 py-2 text-sm font-bold text-nexus-black hover:bg-nexus-green/90 transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)]">{t('nav.joinNow')}</Link>
                            </div>
                        )}

                        {/* Mobile Menu Button ... */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-300 hover:text-white">
                            <Icon icon={isMenuOpen ? "mdi:close" : "mdi:menu"} className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay ... */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-nexus-card bg-black/95 backdrop-blur-xl"
                    >
                        <div className="container mx-auto flex flex-col space-y-4 px-4 py-6">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "text-base font-medium transition-colors hover:text-nexus-green",
                                        isActive(link.path) ? "text-nexus-green" : "text-nexus-white"
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {t(link.label)}
                                </Link>
                            ))}

                            <div className="h-px w-full bg-nexus-card" />
                            <div className="h-px w-full bg-nexus-card" />

                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 py-2">
                                        <img
                                            src={user.current_avatar_url || user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                            alt="Avatar"
                                            className="h-10 w-10 rounded-full bg-nexus-card object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-nexus-white">{user.username}</p>
                                            <p className="text-xs text-nexus-green">{t('profile.lvl')} {user.level} • {user.xp_points} {t('profile.xp')}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link to="/my-courses" className="text-sm text-gray-400 hover:text-nexus-green" onClick={() => setIsMenuOpen(false)}>
                                        {t('common.myCourses')}
                                    </Link>
                                    <Link to="/profile" className="text-sm text-gray-400 hover:text-nexus-green" onClick={() => setIsMenuOpen(false)}>
                                        {t('common.profile')}
                                    </Link>
                                    {user && user.role === 'admin' && (
                                        <Link to="/admin" className="text-sm text-gray-400 hover:text-nexus-green" onClick={() => setIsMenuOpen(false)}>
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    {user && (user.role === 'tutor' || user.role === 'admin') && (
                                        <Link to="/tutor-dashboard" className="text-sm text-gray-400 hover:text-nexus-green" onClick={() => setIsMenuOpen(false)}>
                                            Tutor Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => { logout(); showToast('Logged out successfully!', 'success'); setIsMenuOpen(false); }}
                                        className="text-left text-sm text-red-500 hover:text-red-400"
                                    >
                                        {t('common.logout')}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-2">
                                    <Link to="/login" className="w-full rounded-md border border-nexus-card bg-nexus-card py-2 text-center text-sm font-medium text-nexus-white hover:border-nexus-green hover:text-nexus-green transition-colors" onClick={() => setIsMenuOpen(false)}>
                                        {t('common.login')}
                                    </Link>
                                    <Link to="/register" className="w-full rounded-md bg-nexus-green py-2 text-center text-sm font-medium text-nexus-black hover:bg-nexus-green/90 transition-colors" onClick={() => setIsMenuOpen(false)}>
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
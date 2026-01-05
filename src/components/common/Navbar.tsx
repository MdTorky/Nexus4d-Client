import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { cn } from '../ui/Button';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const timeoutRef = useRef<any>(null);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
        }, 200);
    };

    const links = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.courses'), path: '/courses' },
        { name: t('nav.about'), path: '/about' },
        { name: t('nav.contact'), path: '/contact' },
        { name: t('nav.becomeTutor'), path: '/tutor-application' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-50 w-full border-b border-nexus-card bg-nexus-black/80 backdrop-blur-md"
        >
            {/* Added 'relative' here to act as the anchor for absolute positioning */}
            <div className="relative container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img src="/Logo Horizontal.png" alt="Nexus 4D" className="w-24 object-contain" />
                </Link>

                {/* Desktop Links - CENTERED ABSOLUTELY */}
                {/* Changed class to absolute center */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-nexus-green",
                                isActive(link.path) ? "text-nexus-green" : "text-nexus-white"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* User Actions (Desktop) */}
                <div className="hidden lg:flex items-center gap-4">
                    <LanguageSwitcher />

                    {user ? (
                        <div className="flex items-center gap-4">
                            <div
                                className="relative"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-2 rounded-full border border-nexus-card bg-nexus-card px-2 py-1 transition-colors hover:border-nexus-green">
                                    <img
                                        src={user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                        alt="Avatar"
                                        className="h-6 w-6 rounded-full bg-nexus-black object-cover"
                                    />
                                    <span className="text-xs font-medium text-nexus-white pr-1">
                                        {user.username}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-2 w-48 flex-col rounded-md border border-nexus-card bg-nexus-black shadow-lg overflow-hidden"
                                        >
                                            <div className="absolute -top-2 left-0 h-2 w-full bg-transparent" />
                                            <Link to="/my-courses" className="block px-4 py-2 text-sm text-gray-400 hover:bg-nexus-card hover:text-nexus-green transition-colors">
                                                {t('common.myCourses')}
                                            </Link>
                                            <Link
                                                to="/profile"
                                                className="block px-4 py-2 text-sm text-gray-400 hover:bg-nexus-card hover:text-nexus-green transition-colors"
                                            >
                                                {t('common.profile')}
                                            </Link>
                                            <button
                                                onClick={() => { logout(); showToast('Logged out successfully!', 'success'); }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-nexus-card hover:text-red-500 transition-colors"
                                            >
                                                {t('common.logout')}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-medium text-nexus-white hover:text-nexus-green">
                                {t('common.login')}
                            </Link>
                            <Link to="/register" className="rounded-md bg-nexus-green px-4 py-2 text-sm font-medium text-nexus-black transition-opacity hover:bg-nexus-green/90">
                                {t('nav.joinNow')}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-4 lg:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-nexus-white hover:text-nexus-green focus:outline-none"
                    >
                        <Icon icon={isMobileMenuOpen ? "mdi:close" : "mdi:menu"} width={28} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-nexus-card bg-nexus-black/95 backdrop-blur-xl lg:hidden"
                    >
                        <div className="container mx-auto flex flex-col space-y-4 px-4 py-6">
                            {links.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "text-base font-medium transition-colors hover:text-nexus-green",
                                        isActive(link.path) ? "text-nexus-green" : "text-nexus-white"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}

                            <div className="h-px w-full bg-nexus-card" />

                            {/* Mobile Language Switcher */}
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-400">{t('nav.language')}</span>
                                <LanguageSwitcher />
                            </div>

                            <div className="h-px w-full bg-nexus-card" />

                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 py-2">
                                        <img
                                            src={user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                            alt="Avatar"
                                            className="h-10 w-10 rounded-full bg-nexus-card object-cover"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-nexus-white">{user.username}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <Link to="/my-courses" className="text-sm text-gray-400 hover:text-nexus-green">
                                        {t('common.myCourses')}
                                    </Link>
                                    <Link to="/profile" className="text-sm text-gray-400 hover:text-nexus-green">
                                        {t('common.profile')}
                                    </Link>
                                    <button
                                        onClick={() => { logout(); showToast('Logged out successfully!', 'success'); }}
                                        className="text-left text-sm text-red-500 hover:text-red-400"
                                    >
                                        {t('common.logout')}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-2">
                                    <Link to="/login" className="w-full rounded-md border border-nexus-card bg-nexus-card py-2 text-center text-sm font-medium text-nexus-white hover:border-nexus-green hover:text-nexus-green transition-colors">
                                        {t('common.login')}
                                    </Link>
                                    <Link to="/register" className="w-full rounded-md bg-nexus-green py-2 text-center text-sm font-medium text-nexus-black hover:bg-nexus-green/90 transition-colors">
                                        {t('nav.joinNow')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
import { Link, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const timeoutRef = useRef<any>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setDropdownOpen(false);
        }, 200); // 200ms grace period
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
            <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    {/* <span className="text-xl font-bold text-nexus-white">
                        Nexus <span className="text-nexus-green">4D</span>
                    </span> */}
                    <img src="Logo Horizontal.png" alt="" className="w-24" />
                </Link>

                {/* Desktop Links */}
                <div className="hidden items-center gap-6 lg:flex">
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

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/my-courses" className="text-sm text-nexus-white hover:text-nexus-green hidden md:block">
                                {t('common.myCourses')}
                            </Link>

                            {/* DROPDOWN CONTAINER */}
                            <div
                                className="relative"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button className="flex items-center gap-2 rounded-full border border-nexus-card bg-nexus-card px-2 py-1 transition-colors hover:border-nexus-green">
                                    <img
                                        src={user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                        alt="Avatar"
                                        className="h-6 w-6 rounded-full bg-nexus-black"
                                    />
                                    <span className="hidden text-xs font-medium text-nexus-white md:block pr-1">
                                        {user.username}
                                    </span>
                                </button>

                                {/* ANIMATED DROPDOWN */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 top-full mt-2 w-48 flex-col rounded-md border border-nexus-card bg-nexus-black shadow-lg"
                                        >
                                            {/* Invisible bridge to prevent closing if mouse slips */}
                                            <div className="absolute -top-2 left-0 h-2 w-full bg-transparent" />

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
                        // ... (keep your existing "Login / Join Now" block here)
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
            </div>
        </motion.nav>
    );
}

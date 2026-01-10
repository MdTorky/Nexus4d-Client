import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import EnrollmentAnalytics from '../components/admin/EnrollmentAnalytics';
import ApplicationsList from '../components/admin/ApplicationsList';
import ApplicationsAnalytics from '../components/admin/ApplicationsAnalytics';
import CourseManagerAnalytics from '../components/admin/CourseManagerAnalytics';
import PendingEnrollmentsList from '../components/admin/PendingEnrollmentsList';
import CourseList from '../components/admin/CourseList';
import AccountsList from '../components/admin/AccountsList';
import AccountsAnalytics from '../components/admin/AccountsAnalytics';
import PromoCodeManager from '../components/admin/PromoCodeManager';
import NexonManager from '../components/admin/NexonManager';

export default function AdminDashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    // Derived state from URL to enable persistence
    const activeTab = searchParams.get('tab') || 'accounts';
    const subTab = searchParams.get('view') || 'requests';

    const handleTabChange = (tab: string) => {
        setSearchParams({ tab, view: 'requests' }); // Reset sub-tab when tab changes
    };

    const handleSubTabChange = (view: string) => {
        setSearchParams({ tab: activeTab, view });
    };

    const navItems = [
        { id: 'accounts', label: 'Accounts', icon: 'mdi:account-group' },
        { id: 'applications', label: 'Applications', icon: 'mdi:briefcase-account' },
        { id: 'courses', label: 'Courses', icon: 'mdi:book-education' },
        { id: 'enrollments', label: 'Enrollments', icon: 'mdi:clipboard-check' },
        { id: 'nexons', label: 'Nexons', icon: 'mdi:robot' },
        { id: 'promocodes', label: 'Promo Codes', icon: 'mdi:ticket-percent' },
    ];

    const getPageTitle = () => {
        const item = navItems.find(i => i.id === activeTab);
        return item ? item.label : 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-nexus-black text-white flex">

            {/* Sidebar */}
            <div className="w-64 bg-nexus-card/50 border-r border-white/5 backdrop-blur-xl h-screen sticky top-0 flex flex-col p-6 overflow-y-auto">
                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-lg bg-nexus-green flex items-center justify-center">
                        <Icon icon="mdi:shield-crown" className="text-black text-xl" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Admin</h1>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Control Panel</p>
                    </div>
                </div>

                <nav className="space-y-1 flex-1">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${activeTab === item.id
                                ? 'bg-nexus-green/10 text-nexus-green'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute inset-0 bg-nexus-green/10 rounded-xl"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon
                                icon={item.icon}
                                className={`text-xl relative z-10 transition-colors ${activeTab === item.id ? 'text-nexus-green' : 'text-gray-500 group-hover:text-white'
                                    }`}
                            />
                            <span className="relative z-10 font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                            {/* <Icon icon="mdi:account" className="text-gray-400" /> */}
                            <img src={user?.current_avatar_url} alt="" className='p-1' />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user?.username}</p>
                            <p className="text-xs text-nexus-green flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-nexus-green animate-pulse" /> Online
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 h-screen overflow-y-auto w-full">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight mb-2">{getPageTitle()}</h2>
                        <p className="text-gray-400">Manage your platform resources</p>
                    </div>

                    {/* Contextual Actions (Top Right) */}
                    {/* {activeTab === 'courses' && subTab === 'requests' && (
                        <Link
                            to="/admin/courses/create"
                            className="flex items-center gap-2 bg-nexus-green text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                        >
                            <Icon icon="mdi:plus" className="text-xl" />
                            <span>Create Course</span>
                        </Link>
                    )} */}
                </header>

                <div className="bg-[#09090b] border border-white/10 rounded-3xl p-1 overflow-hidden min-h-[600px] shadow-2xl relative">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-black/40 backdrop-blur-3xl rounded-[22px] h-full p-6 md:p-8"
                        >
                            {/* Sub-Tabs Navigation for complex pages */}
                            {(activeTab === 'applications' || activeTab === 'enrollments' || activeTab === 'courses' || activeTab === 'accounts') && (
                                <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8">
                                    {(activeTab === 'accounts' ? [
                                        { id: 'requests', label: 'User List' },
                                        { id: 'overview', label: 'Analytics' }
                                    ] : activeTab === 'courses' ? [
                                        { id: 'requests', label: 'Manage Courses' },
                                        { id: 'overview', label: 'Overview & Analytics' }
                                    ] : [
                                        { id: 'requests', label: 'Requests' },
                                        { id: 'overview', label: 'Overview & Analytics' }
                                    ]).map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleSubTabChange(tab.id)}
                                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${subTab === tab.id
                                                ? 'bg-nexus-card text-white shadow-lg border border-white/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Dynamic Content Rendering */}
                            <div className="relative z-10">
                                {activeTab === 'applications' && (
                                    subTab === 'requests' ? <ApplicationsList /> : <ApplicationsAnalytics />
                                )}

                                {activeTab === 'enrollments' && (
                                    subTab === 'requests' ? <PendingEnrollmentsList /> : <EnrollmentAnalytics />
                                )}

                                {activeTab === 'courses' && (
                                    subTab === 'requests' ? <CourseList /> : <CourseManagerAnalytics />
                                )}

                                {activeTab === 'accounts' && (
                                    subTab === 'requests' ? <AccountsList /> : <AccountsAnalytics />
                                )}

                                {activeTab === 'nexons' && <NexonManager />}
                                {activeTab === 'promocodes' && <PromoCodeManager />}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden rounded-2xl bg-nexus-card p-8 border border-white/5">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nexus-green to-emerald-400 mb-2">
                        {t('common.welcome', { defaultValue: 'Welcome' })}, {user?.username || 'User'}
                    </h1>
                    <p className="text-nexus-gray text-lg max-w-2xl">
                        Welcome to your Nexus 4D Dashboard. Track your orders, manage your profile, and explore the 4th dimension of commerce.
                    </p>
                </div>

                {/* Decorative Background Glow */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-nexus-green/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Stats Grid Placeholders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Orders', value: '12', change: '+2 new' },
                    { label: 'Active Projects', value: '4', change: 'On track' },
                    { label: 'Pending Reviews', value: '3', change: 'Action needed' },
                ].map((stat, index) => (
                    <div key={index} className="bg-nexus-card p-6 rounded-xl border border-white/5 hover:border-nexus-green/30 transition-all duration-300 group">
                        <h3 className="text-nexus-gray text-sm font-medium">{stat.label}</h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                            <span className="text-sm text-nexus-green">{stat.change}</span>
                        </div>
                        <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-nexus-green w-2/3 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-nexus-card p-6 rounded-xl border border-white/5 min-h-[300px]">
                    <h2 className="text-xl font-semibold mb-4 text-white">Recent Activity</h2>
                    <div className="flex flex-col gap-4">
                        <div className="text-nexus-gray text-center py-10">No recent activity</div>
                    </div>
                </div>

                <div className="bg-nexus-card p-6 rounded-xl border border-white/5 min-h-[300px]">
                    <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-lg bg-black/40 hover:bg-nexus-green/10 border border-white/10 hover:border-nexus-green/50 transition-all text-sm font-medium">
                            Create New Order
                        </button>
                        <button className="p-4 rounded-lg bg-black/40 hover:bg-nexus-green/10 border border-white/10 hover:border-nexus-green/50 transition-all text-sm font-medium">
                            View Analytics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

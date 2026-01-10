import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { FullScreenLoader, Loader } from '../ui/Loader';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
    current_avatar_url: string;
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'tutor' | 'admin';
    is_active: boolean;
    createdAt: string;
    // Stats
    level: number;
    nexonsCount: number; // Avatars
    friendsCount: number;
    followingCount: number;
    followersCount: number;
    enrolledCount: number;
    assignedCoursesCount: number;
    avatar_url?: string;
}

export default function AccountsList() {
    const { showToast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch] = useDebounce(searchTerm, 300);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);


    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/user/admin/users');
            setUsers(data);
        } catch (error: any) {
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleActionClick = (user: User) => {
        if (user.is_active) {
            // Deactivating - Open Modal
            setSelectedUser(user);
            setReason('');
            setIsModalOpen(true);
        } else {
            // Activating - Direct Action
            confirmToggle(user._id, false, '');
        }
    };

    const confirmToggle = async (userId: string, isDeactivating: boolean, reasonText: string) => {
        if (!isDeactivating && !window.confirm(`Are you sure you want to activate this user?`)) return;

        setProcessing(true);
        try {
            await api.put(`/user/admin/users/${userId}/status`, {
                is_active: !isDeactivating,
                reason: reasonText
            });

            showToast(`User ${isDeactivating ? 'deactivated' : 'activated'}`, 'success');

            // Optimistic update
            setUsers(users.map(u => u._id === userId ? { ...u, is_active: !isDeactivating } : u));
            setIsModalOpen(false);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeactivateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        confirmToggle(selectedUser._id, true, reason);
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader text="Loading Accounts" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full max-w-sm group">
                    <div className="absolute inset-0 bg-nexus-green/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-nexus-green transition-colors" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-nexus-black/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-nexus-green/50 focus:ring-1 focus:ring-nexus-green/50 backdrop-blur-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-gray-400 text-sm">Total Accounts:</span>
                    <span className="text-nexus-green font-bold text-lg">{filteredUsers.length}</span>
                </div>
            </div>

            <div className="bg-[#09090b]/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/5">User Profile</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/5">Role</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/5">Engagement</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/5">Status</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/5">Joined</th>
                                <th className="p-5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-white/5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                <img
                                                    src={user.current_avatar_url}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover p-1"
                                                />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-nexus-green transition-colors">{user.username}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${user.role === 'admin' ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                                            user.role === 'tutor' ? 'border-nexus-green/20 text-nexus-green bg-nexus-green/5' :
                                                'border-blue-500/20 text-blue-400 bg-blue-500/5'
                                            }`}>
                                            <Icon icon={
                                                user.role === 'admin' ? "mdi:shield-crown" :
                                                    user.role === 'tutor' ? "mdi:teach" :
                                                        "mdi:school"
                                            } />
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <span className="bg-white/5 px-1.5 py-0.5 rounded text-white font-mono">Lvl {user.level || 1}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Icon icon="mdi:robot" className="text-purple-400" /> {user.nexonsCount || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs opacity-60">
                                                <span className="flex items-center gap-1"><Icon icon="mdi:account-group" /> {user.friendsCount || 0} Friends</span>
                                                <span className="flex items-center gap-1"><Icon icon="mdi:book-open-page-variant" /> {user.enrolledCount || 0} Enrollments</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-nexus-green shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                                            <span className={`text-sm font-medium ${user.is_active ? 'text-white' : 'text-gray-500'}`}>
                                                {user.is_active ? 'Active' : 'Deactivated'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-sm text-gray-500 font-mono">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleActionClick(user)}
                                                className={`p-2 rounded-lg transition-all ${user.is_active
                                                    ? 'hover:bg-red-500/10 text-gray-400 hover:text-red-500'
                                                    : 'hover:bg-nexus-green/10 text-gray-400 hover:text-nexus-green'
                                                    }`}
                                                title={user.is_active ? "Deactivate User" : "Activate User"}
                                            >
                                                <Icon icon={user.is_active ? "mdi:account-off-outline" : "mdi:account-check-outline"} className="text-xl" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-500">
                                            <Icon icon="mdi:account-search" className="text-5xl opacity-20" />
                                            <p className="text-sm">No accounts found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deactivation Modal */}
            <AnimatePresence>
                {isModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-[#09090b] border border-red-500/30 rounded-2xl p-8 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(239,68,68,0.15)]"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 mb-6 mx-auto">
                                <Icon icon="mdi:shield-alert" className="text-3xl text-red-500" />
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2 text-center uppercase tracking-tight">Deactivate Account</h3>
                            <p className="text-gray-400 text-sm mb-8 text-center leading-relaxed">
                                You are about to block access for <strong className="text-white">{selectedUser.username}</strong>.
                                This action requires a logged reason for audit purposes.
                            </p>

                            <form onSubmit={handleDeactivateSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Reason for Termination</label>
                                    <textarea
                                        className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 min-h-[100px] resize-none transition-all placeholder-gray-600"
                                        placeholder="Enter violation details or administrative reason..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-gray-400 font-bold hover:bg-white/5 transition-colors"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Icon icon="eos-icons:loading" className="animate-spin" /> : <Icon icon="mdi:gavel" />}
                                        Deactivate
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

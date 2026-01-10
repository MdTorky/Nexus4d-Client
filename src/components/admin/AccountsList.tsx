import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { FullScreenLoader } from '../ui/Loader';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
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

    if (loading) return <FullScreenLoader />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white outline-none focus:border-nexus-green"
                    />
                </div>
                <div className="text-sm text-gray-400">
                    Total: <span className="text-white font-bold">{filteredUsers.length}</span>
                </div>
            </div>

            <div className="bg-nexus-card rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Stats & Social</th>
                                <th className="p-4">Enrollments</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-bold text-white">{user.username}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`text-xs px-2 py-1 rounded capitalize border ${user.role === 'admin' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                                user.role === 'tutor' ? 'border-nexus-green/30 text-nexus-green bg-nexus-green/10' :
                                                    'border-gray-700 text-gray-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="space-y-1 text-gray-400">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="bg-white/5 rounded px-2 py-0.5 text-xs text-white border border-white/10">
                                                    Lvl {user.level || 1}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Icon icon="mdi:robot-happy-outline" className="text-purple-400" width="14" />
                                                    <span className="text-white font-bold">{user.nexonsCount || 0}</span> Nexons
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span title="Friends"><Icon icon="mdi:account-heart" className="inline mr-0.5 text-pink-500" /> {user.friendsCount}</span>
                                                <span className="text-gray-600">|</span>
                                                <span title="Following"><Icon icon="mdi:account-arrow-right" className="inline mr-0.5 text-blue-400" /> {user.followingCount}</span>
                                                <span className="text-gray-600">|</span>
                                                <span title="Followers"><Icon icon="mdi:account-group" className="inline mr-0.5 text-nexus-green" /> {user.followersCount}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        <div>
                                            Enrolled: <span className="text-white">{user.enrolledCount}</span>
                                        </div>
                                        {user.role === 'tutor' && (
                                            <div className="text-nexus-green mt-1">
                                                Teaching: <span className="font-bold">{user.assignedCoursesCount}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1.5 text-xs font-bold ${user.is_active ? 'text-green-400' : 'text-red-400'}`}>
                                            <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-right">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleActionClick(user)}
                                                className={`text-xs px-3 py-1.5 rounded font-bold transition-colors ${user.is_active
                                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                        : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                    }`}
                                            >
                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deactivation Reason Modal */}
            <AnimatePresence>
                {isModalOpen && selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-nexus-card border border-red-500/30 rounded-xl p-6 w-full max-w-md relative z-10 shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Deactivate Account</h3>
                            <p className="text-gray-400 text-sm mb-4">
                                You are about to deactivate <strong className="text-white">{selectedUser.username}</strong>'s account.
                                Please provide a reason.
                            </p>

                            <form onSubmit={handleDeactivateSubmit}>
                                <textarea
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white text-sm outline-none focus:border-red-500 mb-4 h-24 resize-none"
                                    placeholder="Reason for deactivation (e.g., Violation of Terms)..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                />

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-400 hover:text-white text-sm"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                    >
                                        {processing && <Icon icon="eos-icons:loading" className="animate-spin" />}
                                        Deactivate User
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

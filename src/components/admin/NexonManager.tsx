import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../ui/Loader';
import { motion, AnimatePresence } from 'framer-motion';

interface Avatar {
    _id: string;
    name: string;
    image_url: string;
    type: 'default' | 'premium' | 'reward';
    unlock_condition: 'none' | 'course_completion' | 'level_up' | 'token';
    category: 'male' | 'female' | 'general' | 'admin';
    required_level: number;
    is_active: boolean;
}

interface ScannedIcon {
    name: string;
    path: string;
}

export default function NexonManager() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'library' | 'scan'>('library');
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [scannedIcons, setScannedIcons] = useState<ScannedIcon[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters & Search
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'default' | 'premium' | 'reward'>('all');
    const [filterCategory, setFilterCategory] = useState<'all' | 'male' | 'female' | 'general' | 'admin'>('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAvatar, setEditingAvatar] = useState<Partial<Avatar> | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (activeTab === 'library') fetchAvatars();
        else fetchScannedIcons();
    }, [activeTab]);

    const fetchAvatars = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/avatar/all');
            setAvatars(data);
        } catch (error) {
            showToast('Failed to load nexons', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchScannedIcons = async () => {
        setLoading(true);
        try {
            // Fetch registered avatars first if not already (though usually valid)
            const { data: registeredAvatars } = await api.get('/avatar/all'); // Ensure we have latest
            const registeredPaths = new Set(registeredAvatars.map((a: any) => a.image_url));

            // Fetch manifest from public folder
            const response = await fetch('/icons.json');
            if (!response.ok) throw new Error('Failed to load icons manifest');
            const allIcons: ScannedIcon[] = await response.json();

            // Filter
            const newIcons = allIcons.filter(icon => !registeredPaths.has(icon.path));
            setScannedIcons(newIcons);
        } catch (error) {
            console.error(error);
            showToast('Scan failed. Ensure icons.json is generated.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isCreating) {
                await api.post('/avatar', editingAvatar);
                showToast('Nexon added successfully', 'success');
                setIsModalOpen(false);
                setActiveTab('library');
            } else {
                await api.put(`/avatar/${editingAvatar?._id}`, editingAvatar);
                showToast('Nexon updated successfully', 'success');
                setIsModalOpen(false);
                fetchAvatars();
            }
        } catch (error) {
            showToast('Failed to save', 'error');
        }
    };

    // const handleDelete = async (id: string) => {
    //     if (!window.confirm('Are you sure you want to delete this Nexon? It will reappear in the Scan list if the file exists.')) return;
    //     try {
    //         await api.delete(`/avatar/${id}`);
    //         showToast('Nexon deleted', 'success');
    //         fetchAvatars();
    //     } catch (error) {
    //         showToast('Failed to delete', 'error');
    //     }
    // };

    const openCreateModal = (icon: ScannedIcon) => {
        setEditingAvatar({
            name: icon.name.replace(/\.[^/.]+$/, ""), // remove extension
            image_url: icon.path,
            type: 'default',
            unlock_condition: 'none',
            category: 'general',
            required_level: 0,
            is_active: true
        });
        setIsCreating(true);
        setIsModalOpen(true);
    };

    const openEditModal = (avatar: Avatar) => {
        setEditingAvatar(avatar);
        setIsCreating(false);
        setIsModalOpen(true);
    };

    const toggleActive = async (avatar: Avatar) => {
        try {
            await api.put(`/avatar/${avatar._id}`, { ...avatar, is_active: !avatar.is_active });
            showToast(`Nexon ${!avatar.is_active ? 'activated' : 'deactivated'}`, 'success');
            setAvatars(avatars.map(a => a._id === avatar._id ? { ...a, is_active: !a.is_active } : a));
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const filteredAvatars = avatars.filter(avatar => {
        const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || avatar.type === filterType;
        const matchesCategory = filterCategory === 'all' || (avatar.category || 'general') === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    // Render Helpers
    const renderForm = () => (
        <form onSubmit={handleSave} className="space-y-4">
            <div className="flex justify-center mb-6">
                <motion.div
                    layoutId={`avatar-${editingAvatar?.image_url}`}
                    className="w-32 h-32 rounded-full border-2 border-nexus-green/30 bg-black/50 p-4 relative"
                >
                    <img src={editingAvatar?.image_url} alt="Preview" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="text-xs text-nexus-green font-bold uppercase tracking-wider mb-1 block">Name</label>
                    <input
                        className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none transition-all"
                        value={editingAvatar?.name}
                        onChange={e => setEditingAvatar(prev => ({ ...prev!, name: e.target.value }))}
                        required
                    />
                </div>

                <div>
                    <label className="text-xs text-nexus-green font-bold uppercase tracking-wider mb-1 block">Category</label>
                    <div className="relative">
                        <select
                            className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-nexus-green outline-none appearance-none"
                            value={editingAvatar?.category || 'general'}
                            onChange={e => setEditingAvatar(prev => ({ ...prev!, category: e.target.value as any }))}
                        >
                            <option value="general">General</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="admin">Admin</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-nexus-green font-bold uppercase tracking-wider mb-1 block">Type</label>
                    <div className="relative">
                        <select
                            className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-nexus-green outline-none appearance-none"
                            value={editingAvatar?.type}
                            onChange={e => setEditingAvatar(prev => ({ ...prev!, type: e.target.value as any }))}
                        >
                            <option value="default">Default</option>
                            <option value="premium">Premium</option>
                            <option value="reward">Reward</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-nexus-green font-bold uppercase tracking-wider mb-1 block">Unlock Condition</label>
                    <div className="relative">
                        <select
                            className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-nexus-green outline-none appearance-none"
                            value={editingAvatar?.unlock_condition}
                            onChange={e => setEditingAvatar(prev => ({ ...prev!, unlock_condition: e.target.value as any }))}
                        >
                            <option value="none">None</option>
                            <option value="course_completion">Course Completion</option>
                            <option value="level_up">Level Up</option>
                            <option value="token">Token</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-nexus-green font-bold uppercase tracking-wider mb-1 block">Required Level</label>
                    <input
                        type="number"
                        className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white text-sm focus:border-nexus-green outline-none transition-all"
                        value={editingAvatar?.required_level}
                        onChange={e => setEditingAvatar(prev => ({ ...prev!, required_level: parseInt(e.target.value) }))}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                        type="checkbox"
                        name="toggle"
                        id="is_active_toggle"
                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        checked={editingAvatar?.is_active}
                        onChange={e => setEditingAvatar(prev => ({ ...prev!, is_active: e.target.checked }))}
                        style={{ right: editingAvatar?.is_active ? '0' : 'unset', left: editingAvatar?.is_active ? 'unset' : '0' }}
                    />
                    <label htmlFor="is_active_toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${editingAvatar?.is_active ? 'bg-nexus-green' : 'bg-gray-700'}`}></label>
                </div>
                <label htmlFor="is_active_toggle" className="text-sm text-gray-300 font-medium">Active (Visible to users)</label>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-nexus-green hover:bg-green-400 text-black rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    Save Changes
                </button>
            </div>
        </form>
    );

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Nexon Manager</h2>
                    <p className="text-gray-400 text-sm">Manage avatar assets and unlock conditions.</p>
                </div>

                <div className="flex bg-black/30 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-nexus-green text-black shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Icon icon="mdi:view-grid" /> Library <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full ml-1">{avatars.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'scan' ? 'bg-nexus-green text-black shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Icon icon="mdi:radar" /> Scanner <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full ml-1">{scannedIcons.length}</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            {activeTab === 'library' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-nexus-card/30 rounded-xl border border-white/5"
                >
                    <div className="relative flex-1">
                        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-nexus-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-nexus-green outline-none"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative w-40">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as any)}
                                className="w-full bg-nexus-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-nexus-green outline-none appearance-none"
                            >
                                <option value="all">All Categories</option>
                                <option value="general">General</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="admin">Admin</option>
                            </select>
                            <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative w-40">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value as any)}
                                className="w-full bg-nexus-black border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:border-nexus-green outline-none appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="default">Default</option>
                                <option value="premium">Premium</option>
                                <option value="reward">Reward</option>
                            </select>
                            <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </motion.div>
            )}

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader text="Loading Assets" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <AnimatePresence mode="popLayout">
                        {activeTab === 'library' ? (
                            filteredAvatars.length > 0 ? filteredAvatars.map((avatar, index) => (
                                <motion.div
                                    key={avatar._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.03 }}
                                    layoutId={`avatar-card-${avatar._id}`}
                                    className={`group relative bg-nexus-black border ${avatar.is_active ? 'border-white/10' : 'border-red-500/20'} rounded-2xl p-4 flex flex-col items-center hover:border-nexus-green/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-nexus-green/10`}
                                >
                                    <div className={`relative w-24 h-24 mb-4 transition-all duration-500 ${!avatar.is_active && 'grayscale opacity-50'}`}>
                                        <div className="absolute inset-0 bg-nexus-green/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <img src={avatar.image_url} alt={avatar.name} className="w-full h-full object-contain drop-shadow-lg relative z-10" />
                                    </div>

                                    <div className="text-center w-full relative z-10">
                                        <h3 className="text-white font-bold text-sm truncate w-full mb-1 group-hover:text-nexus-green transition-colors">{avatar.name}</h3>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${avatar.type === 'premium' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                avatar.type === 'reward' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-white/5 text-gray-400 border-white/10'
                                                }`}>
                                                {avatar.type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Glass Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 z-20">
                                        <button
                                            onClick={() => openEditModal(avatar)}
                                            className="w-full py-2 bg-nexus-green text-black text-xs font-bold rounded-lg hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Icon icon="mdi:pencil" /> Edit
                                        </button>
                                        <button
                                            onClick={() => toggleActive(avatar)}
                                            className={`w-full py-2 border text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${avatar.is_active
                                                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                                : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                                                }`}
                                        >
                                            <Icon icon={avatar.is_active ? "mdi:eye-off" : "mdi:eye"} />
                                            {avatar.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>

                                    {!avatar.is_active && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <Icon icon="mdi:eye-off" className="text-red-500 opacity-50" />
                                        </div>
                                    )}
                                </motion.div>
                            )) : (
                                <div className="col-span-full text-center py-20 bg-nexus-card/30 rounded-2xl border border-white/5 border-dashed">
                                    <Icon icon="mdi:ghost-off" className="mx-auto text-6xl text-gray-600 mb-4" />
                                    <p className="text-gray-500">{searchTerm || filterType !== 'all' ? 'No nexons match your search.' : 'No nexons found. Add one from Scan tab!'}</p>
                                </div>
                            )
                        ) : (
                            scannedIcons.length > 0 ? scannedIcons.map((icon, index) => (
                                <motion.div
                                    key={icon.path}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => openCreateModal(icon)}
                                    className="group cursor-pointer bg-nexus-card border border-white/5 rounded-2xl p-4 flex flex-col items-center hover:border-nexus-green transition-all hover:bg-white/5 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 bg-nexus-green text-black p-1.5 rounded-bl-xl shadow-lg z-10 group-hover:scale-110 transition-transform">
                                        <Icon icon="mdi:plus-thick" />
                                    </div>

                                    <div className="w-20 h-20 mb-3 relative">
                                        <img src={icon.path} alt={icon.name} className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                                    </div>

                                    <h3 className="text-gray-400 text-xs text-center truncate w-full group-hover:text-nexus-green font-medium transition-colors">{icon.name}</h3>
                                </motion.div>
                            )) : (
                                <div className="col-span-full text-center py-20 bg-nexus-card/30 rounded-2xl border border-white/5 border-dashed">
                                    <Icon icon="mdi:folder-search-outline" className="mx-auto text-6xl text-gray-600 mb-4" />
                                    <p className="text-gray-500">No new icons found in /public/Icons</p>
                                </div>
                            )
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-nexus-black border border-white/10 rounded-2xl p-8 w-full max-w-lg relative z-10 shadow-2xl shadow-nexus-green/10 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-2xl font-bold text-white tracking-tight">
                                    {isCreating ? 'Add New Nexon' : 'Edit Nexon'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <Icon icon="mdi:close" className="text-xl" />
                                </button>
                            </div>

                            {renderForm()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

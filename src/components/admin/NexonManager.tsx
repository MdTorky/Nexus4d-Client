import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { FullScreenLoader } from '../ui/Loader';
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
                // If we were in scan mode, remove it from the list or switch to library?
                // Switch to library to see it
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

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this Nexon? It will reappear in the Scan list if the file exists.')) return;
        try {
            await api.delete(`/avatar/${id}`);
            showToast('Nexon deleted', 'success');
            fetchAvatars();
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

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

    // const handleMassSync = async () => {
    //     if (!window.confirm('This will explicitly set the category of ALL Nexons to "General". This is useful if you have old data without categories. Continue?')) return;
    //     setLoading(true);
    //     try {
    //         const res = await api.put('/avatar/bulk-update-category', { category: 'general' });
    //         showToast(res.data.message, 'success');
    //         fetchAvatars();
    //     } catch (error: any) {
    //         showToast('Failed to sync categories', 'error');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const filteredAvatars = avatars.filter(avatar => {
        const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || avatar.type === filterType;
        const matchesCategory = filterCategory === 'all' || (avatar.category || 'general') === filterCategory;
        return matchesSearch && matchesType && matchesCategory;
    });

    // Render Helpers
    const renderForm = () => (
        <form onSubmit={handleSave} className="space-y-4">
            <div className="flex justify-center mb-4">
                <img src={editingAvatar?.image_url} alt="Preview" className="w-24 h-24 object-contain bg-black/50 rounded-lg p-2" />
            </div>

            <div>
                <label className="text-xs text-gray-400">Name</label>
                <input
                    className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm"
                    value={editingAvatar?.name}
                    onChange={e => setEditingAvatar(prev => ({ ...prev!, name: e.target.value }))}
                    required
                />
            </div>

            <div>
                <label className="text-xs text-gray-400">Category</label>
                <select
                    className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm"
                    value={editingAvatar?.category || 'general'}
                    onChange={e => setEditingAvatar(prev => ({ ...prev!, category: e.target.value as any }))}
                >
                    <option value="general">General</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-gray-400">Type</label>
                    <select
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm"
                        value={editingAvatar?.type}
                        onChange={e => setEditingAvatar(prev => ({ ...prev!, type: e.target.value as any }))}
                    >
                        <option value="default">Default (Free)</option>
                        <option value="premium">Premium</option>
                        <option value="reward">Reward</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-400">Unlock Condition</label>
                    <select
                        className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm"
                        value={editingAvatar?.unlock_condition}
                        onChange={e => setEditingAvatar(prev => ({ ...prev!, unlock_condition: e.target.value as any }))}
                    >
                        <option value="none">None</option>
                        <option value="course_completion">Course Completion</option>
                        <option value="level_up">Level Up</option>
                        <option value="token">Token</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs text-gray-400">Required Level (if Type is Level Up)</label>
                <input
                    type="number"
                    className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white text-sm"
                    value={editingAvatar?.required_level}
                    onChange={e => setEditingAvatar(prev => ({ ...prev!, required_level: parseInt(e.target.value) }))}
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={editingAvatar?.is_active}
                    onChange={e => setEditingAvatar(prev => ({ ...prev!, is_active: e.target.checked }))}
                    id="is_active_check"
                />
                <label htmlFor="is_active_check" className="text-sm text-gray-300">Active (Visible to users)</label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-nexus-green text-black rounded text-sm font-bold">Save</button>
            </div>
        </form>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 border-b border-white/10 pb-4">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`text-sm font-medium pb-1 transition-colors ${activeTab === 'library' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                    >
                        Library ({avatars.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('scan')}
                        className={`text-sm font-medium pb-1 transition-colors ${activeTab === 'scan' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                    >
                        Scan New Files ({scannedIcons.length})
                    </button>
                </div>

                {activeTab === 'library' && (
                    <button
                        onClick={() => setActiveTab('scan')}
                        className="flex items-center gap-2 bg-nexus-green/10 text-nexus-green hover:bg-nexus-green hover:text-black border border-nexus-green/50 px-3 py-1.5 rounded-lg text-sm font-bold transition-all"
                    >
                        <Icon icon="mdi:plus" /> Add New Nexon
                    </button>
                )}

                {/* {activeTab === 'library' && (
                    <button
                        onClick={handleMassSync}
                        className="ml-4 text-xs text-gray-400 hover:text-nexus-green underline"
                        title="Sets all avatars to 'General' category if missing"
                    >
                        Sync Categories
                    </button>
                )} */}
            </div>

            {activeTab === 'library' && (
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Nexons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-nexus-card border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:border-nexus-green outline-none"
                        />
                    </div>
                    <div className="relative w-32">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value as any)}
                            className="w-full bg-nexus-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-green outline-none appearance-none"
                        >
                            <option value="all">All Cats</option>
                            <option value="general">General</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="admin">Admin</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative w-32">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="w-full bg-nexus-card border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-nexus-green outline-none appearance-none"
                        >
                            <option value="all">All Types</option>
                            <option value="default">Default</option>
                            <option value="premium">Premium</option>
                            <option value="reward">Reward</option>
                        </select>
                        <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            )}

            {loading ? <FullScreenLoader /> : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {activeTab === 'library' ? (
                        filteredAvatars.length > 0 ? filteredAvatars.map(avatar => (
                            <div key={avatar._id} className={`bg-nexus-card border ${avatar.is_active ? 'border-white/5' : 'border-red-500/30 bg-red-500/5'} rounded-xl p-4 flex flex-col items-center group relative`}>
                                <img src={avatar.image_url} alt={avatar.name} className={`w-20 h-20 object-contain mb-3 ${!avatar.is_active && 'opacity-50 grayscale'}`} />
                                <h3 className="text-white font-bold text-sm text-center truncate w-full">{avatar.name}</h3>
                                <div className="text-xs text-gray-500 capitalize">{avatar.type}</div>

                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-xl">
                                    <button onClick={() => openEditModal(avatar)} className="text-nexus-green text-xs font-bold hover:underline">Edit</button>
                                    <button onClick={() => toggleActive(avatar)} className={`text-xs font-bold hover:underline ${avatar.is_active ? 'text-yellow-400' : 'text-green-400'}`}>
                                        {avatar.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => handleDelete(avatar._id)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center text-gray-500 py-10">
                                {searchTerm || filterType !== 'all' ? 'No nexons match your search.' : 'No nexons found. Add one from Scan!'}
                            </div>
                        )
                    ) : (
                        scannedIcons.length > 0 ? scannedIcons.map(icon => (
                            <div key={icon.path} className="bg-nexus-card border border-white/5 rounded-xl p-4 flex flex-col items-center hover:border-nexus-green/50 transition-colors cursor-pointer" onClick={() => openCreateModal(icon)}>
                                <div className="relative">
                                    <img src={icon.path} alt={icon.name} className="w-20 h-20 object-contain mb-3 opacity-70" />
                                    <div className="absolute top-0 right-0 bg-nexus-green text-black text-[10px] font-bold px-1.5 py-0.5 rounded shadow">+</div>
                                </div>
                                <h3 className="text-gray-400 text-xs text-center truncate w-full">{icon.name}</h3>
                            </div>
                        )) : (
                            <div className="col-span-full text-center text-gray-500 py-10">No new icons found in /public/Icons</div>
                        )
                    )}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-nexus-card border border-white/10 rounded-xl p-6 w-full max-w-md relative z-10 shadow-xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">{isCreating ? 'Add New Nexon' : 'Edit Nexon'}</h3>
                            {renderForm()}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

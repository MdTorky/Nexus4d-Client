import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Select from '../ui/Select';

interface Material {
    title: string;
    description?: string;
    type: 'video' | 'pdf' | 'link' | 'slide' | 'image';
    url: string;
    min_package_tier: 'basic' | 'advanced' | 'premium';
}

interface Chapter {
    _id: string;
    title: string;
    description: string;
    position: number;
    is_free: boolean;
    materials: Material[];
}

export default function ChapterManager({ courseId, chapters, isReadOnly = false }: { courseId: string; chapters: Chapter[]; onChapterAdded?: (chapter: Chapter) => void; isReadOnly?: boolean }) {
    const { showToast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

    // Chapter Form
    const [chapterForm, setChapterForm] = useState({
        title: '',
        description: '',
        is_free: false,
        xp_reward: 10
    });

    // Add Material Form
    const [isAddingMaterial, setIsAddingMaterial] = useState<string | null>(null); // Chapter ID
    const [materialForm, setMaterialForm] = useState({
        title: '',
        description: '',
        type: 'video', // video, pdf, link, slide
        min_package_tier: 'basic',
        url: '',
        file: null as File | null
    });
    const [uploadProgress, setUploadProgress] = useState(0);

    const resetForm = () => {
        setChapterForm({ title: '', description: '', is_free: false, xp_reward: 10 });
        setIsAdding(false);
        setIsEditing(null);
    };

    const handleEditClick = (chapter: Chapter) => {
        setChapterForm({
            title: chapter.title,
            description: chapter.description,
            is_free: chapter.is_free,
            xp_reward: (chapter as any).xp_reward || 10
        });
        setIsEditing(chapter._id);
        setIsAdding(true);
    };

    const handleDeleteClick = async (chapterId: string) => {
        if (!window.confirm('Are you sure you want to delete this chapter and all its materials?')) return;
        try {
            await api.delete(`/courses/${courseId}/chapters/${chapterId}`);
            showToast('Chapter deleted', 'success');
            window.location.reload(); // Refresh to update list
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to delete chapter', 'error');
        }
    };

    const handleChapterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                title: chapterForm.title,
                description: chapterForm.description,
                position: isEditing ? undefined : chapters.length + 1, // Only send position on create
                is_free: chapterForm.is_free,
                xp_reward: chapterForm.xp_reward
            };

            if (isEditing) {
                await api.put(`/courses/${courseId}/chapters/${isEditing}`, data);
                showToast('Chapter updated', 'success');
            } else {
                await api.post(`/courses/${courseId}/chapters`, data);
                showToast('Chapter created', 'success');
            }

            window.location.reload(); // Refresh to update list
        } catch (error: any) {
            console.error(error);
            showToast(error.response?.data?.message || 'Failed to save chapter', 'error');
        }
    };

    // Material Editing State
    const [editingMaterialIndex, setEditingMaterialIndex] = useState<number | null>(null);

    const handleMaterialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAddingMaterial) return;

        const data = new FormData();
        data.append('title', materialForm.title);
        data.append('description', materialForm.description);
        data.append('type', materialForm.type);
        data.append('min_package_tier', materialForm.min_package_tier);

        if (materialForm.type === 'link') {
            data.append('url', materialForm.url);
        } else if (materialForm.file) {
            data.append('file', materialForm.file);
        } else if (editingMaterialIndex === null) {
            showToast('File required for this type', 'error');
            return;
        }

        try {
            const url = editingMaterialIndex !== null
                ? `/courses/${courseId}/chapters/${isAddingMaterial}/materials/${editingMaterialIndex}`
                : `/courses/${courseId}/chapters/${isAddingMaterial}/materials`;

            const method = editingMaterialIndex !== null ? 'put' : 'post';

            await api[method](url, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });
            showToast(editingMaterialIndex !== null ? 'Material updated' : 'Material added', 'success');
            window.location.reload();
        } catch (error: any) {
            setUploadProgress(0);
            showToast(error.response?.data?.message || 'Failed to save material', 'error');
        }
    };

    const handleEditMaterial = (chapterId: string, material: Material, index: number) => {
        setIsAddingMaterial(chapterId);
        setEditingMaterialIndex(index);
        setMaterialForm({
            title: material.title,
            description: material.description || '',
            type: material.type,
            min_package_tier: material.min_package_tier,
            url: material.url,
            file: null
        });
    };

    const handleDeleteMaterial = async (chapterId: string, index: number) => {
        if (!window.confirm("Delete this material?")) return;
        try {
            await api.delete(`/courses/${courseId}/chapters/${chapterId}/materials/${index}`);
            showToast('Material deleted', 'success');
            window.location.reload();
        } catch (error: any) {
            showToast('Failed to delete material', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-nexus-card/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Curriculum</h3>
                    <p className="text-sm text-gray-400">Manage course chapters and learning materials.</p>
                </div>
                {!isReadOnly && (
                    <button
                        onClick={() => { resetForm(); setIsAdding(!isAdding); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isAdding
                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                : 'bg-nexus-green text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95'
                            }`}
                    >
                        <Icon icon={isAdding ? "mdi:close" : "mdi:plus"} className="text-lg" />
                        {isAdding ? 'Cancel' : 'Add Chapter'}
                    </button>
                )}
            </div>

            {/* Create/Edit Chapter Form */}
            <AnimatePresence>
                {isAdding && !isReadOnly && (
                    <motion.form
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="bg-zinc-900/80 border border-nexus-green/30 rounded-2xl p-6 shadow-xl overflow-hidden relative"
                        onSubmit={handleChapterSubmit}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nexus-green to-transparent" />

                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                <Icon icon={isEditing ? "mdi:pencil-circle" : "mdi:plus-circle"} className="text-nexus-green" />
                                {isEditing ? 'Edit Chapter Content' : 'Create New Chapter'}
                            </h4>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1.5">Chapter Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Introduction to Neural Networks"
                                    value={chapterForm.title}
                                    onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none transition-all placeholder-gray-600 font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1.5">Description</label>
                                <textarea
                                    placeholder="Briefly describe what students will learn in this chapter..."
                                    value={chapterForm.description}
                                    onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none h-24 transition-all placeholder-gray-600 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:border-nexus-green/30 transition-colors">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                checked={chapterForm.is_free}
                                                onChange={e => setChapterForm({ ...chapterForm, is_free: e.target.checked })}
                                                className="peer sr-only"
                                            />
                                            <div className="w-10 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexus-green"></div>
                                        </div>
                                        <div>
                                            <span className="block text-sm font-bold text-white">Free Preview</span>
                                            <span className="block text-xs text-gray-400">Allow users to view without subscription</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:border-nexus-green/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                                            <Icon icon="mdi:lightning-bolt" className="text-xl" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1">XP Reward</label>
                                            <input
                                                type="number"
                                                value={chapterForm.xp_reward}
                                                onChange={e => setChapterForm({ ...chapterForm, xp_reward: Number(e.target.value) })}
                                                className="w-full bg-transparent border-b border-gray-600 focus:border-yellow-500 outline-none text-white font-mono font-bold"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-bold text-sm transition-all"
                                >
                                    Discard Changes
                                </button>
                                <button
                                    type="submit"
                                    className="bg-nexus-green text-black px-8 py-2.5 rounded-lg font-bold hover:bg-green-400 shadow-lg shadow-green-900/20 transition-all transform hover:scale-105 active:scale-95"
                                >
                                    {isEditing ? 'Save Updates' : 'Create Chapter'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Chapters List */}
            <div className="space-y-4">
                {chapters.length === 0 && !isAdding && (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 mx-auto bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4 text-gray-600">
                            <Icon icon="mdi:book-open-page-variant-outline" className="text-3xl" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-2">No Chapters Yet</h4>
                        <p className="text-gray-400 max-w-md mx-auto mb-6">Start building your course curriculum by adding your first chapter.</p>
                        {!isReadOnly && (
                            <button
                                onClick={() => { resetForm(); setIsAdding(true); }}
                                className="text-nexus-green font-bold hover:underline"
                            >
                                + Add First Chapter
                            </button>
                        )}
                    </div>
                )}

                <AnimatePresence mode='popLayout'>
                    {chapters.map((chapter, index) => (
                        <motion.div
                            key={chapter._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-nexus-card border border-white/10 rounded-xl overflow-hidden shadow-lg group hover:border-white/20 transition-colors"
                        >
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer select-none bg-gradient-to-r from-transparent to-white/[0.02]"
                                onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                            >
                                <div className="flex items-center gap-5 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-nexus-black border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                                        <span className="text-lg font-bold text-gray-500 font-mono">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-bold transition-colors ${expandedChapter === chapter._id ? 'text-nexus-green' : 'text-white'}`}>
                                            {chapter.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Icon icon="mdi:file-document-multiple-outline" />
                                                {chapter.materials?.length || 0} Materials
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                            <span className="flex items-center gap-1 text-yellow-500/80">
                                                <Icon icon="mdi:lightning-bolt" />
                                                {(chapter as any).xp_reward || 10} XP
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                            <span className={`flex items-center gap-1 font-bold ${chapter.is_free ? "text-green-400" : "text-gray-400"}`}>
                                                <Icon icon={chapter.is_free ? "mdi:lock-open-check" : "mdi:lock"} />
                                                {chapter.is_free ? 'Free Preview' : 'Locked'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!isReadOnly && (
                                        <div className="flex items-center gap-1 mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(chapter); }}
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Icon icon="mdi:pencil" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteClick(chapter._id); }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Icon icon="mdi:trash-can" />
                                            </button>
                                        </div>
                                    )}
                                    <div className={`p-2 rounded-lg transition-transform duration-300 ${expandedChapter === chapter._id ? 'rotate-180 text-white' : 'text-gray-500'}`}>
                                        <Icon icon="mdi:chevron-down" className="text-2xl" />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Materials View */}
                            <AnimatePresence>
                                {expandedChapter === chapter._id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="border-t border-white/5 bg-black/40 p-4 md:p-6 space-y-3">
                                            {chapter.materials?.length === 0 && !isAddingMaterial && (
                                                <div className="text-center py-8 text-gray-500 text-sm">
                                                    No materials added to this chapter yet.
                                                </div>
                                            )}

                                            {chapter.materials?.map((mat, idx) => (
                                                <motion.div
                                                    key={`${chapter._id}-mat-${idx}`}
                                                    layout
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between p-4 bg-nexus-black/50 border border-white/5 rounded-xl hover:border-white/10 transition-all group/item"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg bg-gray-900 border border-white/10 flex items-center justify-center text-xl shrink-0 ${mat.type === 'video' ? 'text-blue-400' :
                                                                mat.type === 'pdf' ? 'text-red-400' :
                                                                    mat.type === 'link' ? 'text-green-400' :
                                                                        mat.type === 'slide' ? 'text-orange-400' :
                                                                            'text-purple-400'
                                                            }`}>
                                                            <Icon icon={
                                                                mat.type === 'video' ? 'mdi:video' :
                                                                    mat.type === 'pdf' ? 'mdi:file-pdf-box' :
                                                                        mat.type === 'link' ? 'mdi:link' :
                                                                            mat.type === 'slide' ? 'mdi:presentation' :
                                                                                mat.type === 'image' ? 'mdi:image' : 'mdi:file'
                                                            } />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-white font-medium text-sm">{mat.title}</h5>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${mat.min_package_tier === 'premium' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                                                                        mat.min_package_tier === 'advanced' ? 'border-nexus-green/30 text-nexus-green bg-nexus-green/10' :
                                                                            'border-gray-600/30 text-gray-400 bg-gray-800/20'
                                                                    }`}>
                                                                    {mat.min_package_tier}
                                                                </span>
                                                                {mat.description && <span className="text-xs text-gray-500 truncate max-w-[200px]">• {mat.description}</span>}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 items-center">
                                                        {isReadOnly && (
                                                            <a
                                                                href={mat.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 text-xs font-bold text-nexus-green bg-nexus-green/10 hover:bg-nexus-green/20 border border-nexus-green/30 px-3 py-1.5 rounded-lg transition-all"
                                                            >
                                                                <Icon icon="mdi:eye" width="14" /> <span className="hidden sm:inline">View</span>
                                                            </a>
                                                        )}
                                                        {!isReadOnly && (
                                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleEditMaterial(chapter._id, mat, idx)}
                                                                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                                    title="Edit Material"
                                                                >
                                                                    <Icon icon="mdi:pencil" width="16" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMaterial(chapter._id, idx)}
                                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                    title="Delete Material"
                                                                >
                                                                    <Icon icon="mdi:trash-can" width="16" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}

                                            {!isAddingMaterial && !isReadOnly && (
                                                <motion.button
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={() => {
                                                        setIsAddingMaterial(chapter._id);
                                                        setEditingMaterialIndex(null);
                                                        setMaterialForm({ title: '', description: '', type: 'video', min_package_tier: 'basic', url: '', file: null });
                                                    }}
                                                    className="w-full py-3 border border-dashed border-white/10 text-gray-400 text-sm hover:border-nexus-green/50 hover:text-nexus-green hover:bg-nexus-green/5 rounded-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Icon icon="mdi:plus-circle-outline" /> Add Material to Chapter
                                                </motion.button>
                                            )}

                                            {isAddingMaterial === chapter._id && !isReadOnly && (
                                                <motion.form
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    onSubmit={handleMaterialSubmit}
                                                    className="bg-black/40 p-6 rounded-xl border border-white/10 space-y-4 shadow-2xl"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                                            <Icon icon="mdi:file-document-edit" className="text-nexus-green" />
                                                            {editingMaterialIndex !== null ? 'Edit Material' : 'Add New Material'}
                                                        </h5>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsAddingMaterial(null)}
                                                            className="text-gray-500 hover:text-white"
                                                        >
                                                            <Icon icon="mdi:close" />
                                                        </button>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <input
                                                            type="text"
                                                            placeholder="Material Title"
                                                            className="w-full bg-nexus-black border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-nexus-green outline-none"
                                                            value={materialForm.title}
                                                            onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                                                            required
                                                        />
                                                        <textarea
                                                            placeholder="Description (Optional)"
                                                            className="w-full bg-nexus-black border border-white/10 rounded-lg p-2 text-sm text-white h-20 focus:border-nexus-green outline-none resize-none"
                                                            value={materialForm.description}
                                                            onChange={e => setMaterialForm({ ...materialForm, description: e.target.value })}
                                                        />

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <Select
                                                                options={[
                                                                    { label: 'Video', value: 'video', icon: 'mdi:video' },
                                                                    { label: 'PDF Document', value: 'pdf', icon: 'mdi:file-pdf-box' },
                                                                    { label: 'Slides', value: 'slide', icon: 'mdi:presentation' },
                                                                    { label: 'External Link', value: 'link', icon: 'mdi:link' },
                                                                    { label: 'Image', value: 'image', icon: 'mdi:image' }
                                                                ]}
                                                                value={materialForm.type}
                                                                onChange={(val) => setMaterialForm({ ...materialForm, type: val as any })}
                                                                placeholder="Type"
                                                                searchable={false}
                                                                className="w-full"
                                                            />
                                                            <Select
                                                                options={[
                                                                    { label: 'Basic (All)', value: 'basic', icon: 'mdi:check-circle-outline' },
                                                                    { label: 'Advanced +', value: 'advanced', icon: 'mdi:star' },
                                                                    { label: 'Premium Only', value: 'premium', icon: 'mdi:crown' }
                                                                ]}
                                                                value={materialForm.min_package_tier}
                                                                onChange={(val) => setMaterialForm({ ...materialForm, min_package_tier: val as any })}
                                                                placeholder="Access Tier"
                                                                searchable={false}
                                                                className="w-full"
                                                            />
                                                        </div>

                                                        {materialForm.type === 'link' ? (
                                                            <div className="relative">
                                                                <Icon icon="mdi:link" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                                <input
                                                                    type="url"
                                                                    placeholder="https://..."
                                                                    className="w-full bg-nexus-black border border-white/10 rounded-lg pl-9 p-2.5 text-sm text-white focus:border-nexus-green outline-none"
                                                                    value={materialForm.url}
                                                                    onChange={e => setMaterialForm({ ...materialForm, url: e.target.value })}
                                                                    required
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3 p-4 border border-dashed border-white/10 rounded-xl bg-white/5">
                                                                {editingMaterialIndex !== null && materialForm.url && !materialForm.file && (
                                                                    <div className="flex items-center gap-3 p-2 bg-nexus-green/10 rounded-lg border border-nexus-green/20">
                                                                        <Icon icon="mdi:check-circle" className="text-nexus-green" />
                                                                        <span className="text-xs text-white truncate flex-1">Current: {materialForm.url.split('/').pop()}</span>
                                                                        <a href={materialForm.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-nexus-green uppercase hover:underline">View</a>
                                                                    </div>
                                                                )}

                                                                <div className="relative group">
                                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                        <Icon icon="mdi:cloud-upload" className="text-3xl text-gray-500 mb-2 group-hover:text-white transition-colors" />
                                                                        <p className="text-sm text-gray-400 group-hover:text-white"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                                    </div>
                                                                    <input
                                                                        type="file"
                                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                                        onChange={e => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                                                                        required={editingMaterialIndex === null}
                                                                    />
                                                                </div>

                                                                {materialForm.file && (
                                                                    <div className="text-xs text-white bg-blue-500/20 p-2 rounded border border-blue-500/30 flex items-center gap-2">
                                                                        <Icon icon="mdi:file" /> Selected: {materialForm.file.name}
                                                                    </div>
                                                                )}

                                                                {uploadProgress > 0 && (
                                                                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                                                                        <div className="bg-nexus-green h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsAddingMaterial(null)}
                                                                className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                type="submit"
                                                                className="bg-white text-black px-6 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 shadow-lg shadow-white/10 transition-all"
                                                            >
                                                                {editingMaterialIndex !== null ? 'Save Changes' : 'Add Material'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.form>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

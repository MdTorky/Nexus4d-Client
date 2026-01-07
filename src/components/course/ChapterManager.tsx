import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Select from '../ui/Select';

interface Material {
    title: string;
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



export default function ChapterManager({ courseId, chapters }: { courseId: string; chapters: Chapter[]; onChapterAdded: (chapter: Chapter) => void }) {
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

    // ... (Material Submit remains mostly the same, omitting for brevity in tool call if not modifying logic)
    // Actually, I need to provide the full content or use multi_replace. Standard replace preferred for full function refactor.
    // I will include the material submit as well to ensure it's preserved.

    // Material Editing State
    const [editingMaterialIndex, setEditingMaterialIndex] = useState<number | null>(null);

    const handleMaterialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAddingMaterial) return;

        const data = new FormData();
        data.append('title', materialForm.title);
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
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Curriculum</h3>
                <button
                    onClick={() => { resetForm(); setIsAdding(!isAdding); }}
                    className="flex items-center gap-2 text-nexus-green hover:underline"
                >
                    <Icon icon="mdi:plus" /> {isAdding ? 'Close Form' : 'Create Chapter'}
                </button>
            </div>

            {/* Create/Edit Chapter Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-nexus-card p-6 rounded-xl border border-nexus-green/30  mb-6"
                        onSubmit={handleChapterSubmit}
                    >
                        <h4 className="text-lg font-bold text-white mb-4">{isEditing ? 'Edit Chapter' : 'New Chapter'}</h4>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Chapter Title"
                                value={chapterForm.title}
                                onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white outline-none"
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={chapterForm.description}
                                onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })}
                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white outline-none h-24"
                            />
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={chapterForm.is_free}
                                        onChange={e => setChapterForm({ ...chapterForm, is_free: e.target.checked })}
                                        className="accent-nexus-green"
                                    />
                                    <span className="text-sm text-gray-300">Allow as Free Preview</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon icon="mdi:lightning-bolt" className="text-yellow-400" />
                                    <input
                                        type="number"
                                        placeholder="XP Reward"
                                        value={chapterForm.xp_reward}
                                        onChange={e => setChapterForm({ ...chapterForm, xp_reward: Number(e.target.value) })}
                                        className="bg-black/50 border border-gray-700 rounded p-1 text-white w-20 text-sm"
                                        min="0"
                                    />
                                    <span className="text-sm text-gray-400">XP</span>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-400">Cancel</button>
                                <button type="submit" className="bg-nexus-green text-black px-6 py-2 rounded-lg font-bold">
                                    {isEditing ? 'Update Chapter' : 'Create Chapter'}
                                </button>
                            </div>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Chapters List */}
            <div className="space-y-4">
                {chapters.map((chapter) => (
                    <div key={chapter._id} className="bg-nexus-card/50 border border-white/5 rounded-lg ">
                        <div
                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <div
                                className="flex items-center gap-4 flex-1"
                                onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)}
                            >
                                <div className="bg-gray-800 w-8 h-8 flex items-center justify-center rounded-full text-sm font-mono text-gray-400 shrink-0">
                                    {chapter.position}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{chapter.title}</h4>
                                    <p className="text-xs text-gray-500 flex gap-2">
                                        <span>{chapter.materials?.length || 0} Materials</span>
                                        <span>•</span>
                                        <span>{(chapter as any).xp_reward || 10} XP</span>
                                        <span>•</span>
                                        <span className={chapter.is_free ? "text-green-400" : "text-gray-400"}>{chapter.is_free ? 'Free' : 'Locked'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEditClick(chapter)} className="p-2 text-gray-400 hover:text-white" title="Edit">
                                    <Icon icon="mdi:pencil" />
                                </button>
                                <button onClick={() => handleDeleteClick(chapter._id)} className="p-2 text-gray-400 hover:text-red-500" title="Delete">
                                    <Icon icon="mdi:trash-can" />
                                </button>
                                <button onClick={() => setExpandedChapter(expandedChapter === chapter._id ? null : chapter._id)} className="p-2 text-gray-400">
                                    <Icon icon={expandedChapter === chapter._id ? "mdi:chevron-up" : "mdi:chevron-down"} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Materials View */}
                        <AnimatePresence>
                            {expandedChapter === chapter._id && (
                                <motion.div
                                    initial={{ height: 0, overflow: 'hidden' }}
                                    animate={{ height: 'auto', overflow: 'visible' }}
                                    exit={{ height: 0, overflow: 'hidden' }}
                                    className="border-t border-white/5 bg-black/30"
                                >
                                    <div className="p-4 space-y-3">
                                        {chapter.materials?.map((mat, idx) => (
                                            <div key={idx} className=" flex items-center justify-between p-3 bg-nexus-black rounded border border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <Icon icon={
                                                        mat.type === 'video' ? 'mdi:video' :
                                                            mat.type === 'pdf' ? 'mdi:file-pdf-box' :
                                                                mat.type === 'link' ? 'mdi:link' :
                                                                    mat.type === 'slide' ? 'mdi:presentation' : 'mdi:image'
                                                    } className="text-nexus-green" />
                                                    <span className="text-sm text-gray-300">{mat.title}</span>
                                                    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${mat.min_package_tier === 'premium' ? 'border-purple-500 text-purple-400' :
                                                        mat.min_package_tier === 'advanced' ? 'border-nexus-green text-nexus-green' :
                                                            'border-gray-600 text-gray-400'
                                                        }`}>
                                                        {mat.min_package_tier}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditMaterial(chapter._id, mat, idx)}
                                                        className="text-gray-500 hover:text-white"
                                                    >
                                                        <Icon icon="mdi:pencil" width="16" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMaterial(chapter._id, idx)}
                                                        className="text-gray-500 hover:text-red-500"
                                                    >
                                                        <Icon icon="mdi:trash-can" width="16" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {!isAddingMaterial && (
                                            <button
                                                onClick={() => {
                                                    setIsAddingMaterial(chapter._id);
                                                    setEditingMaterialIndex(null);
                                                    setMaterialForm({ title: '', type: 'video', min_package_tier: 'basic', url: '', file: null });
                                                }}
                                                className="w-full py-2 border border-dashed border-gray-700 text-gray-400 text-sm hover:border-nexus-green hover:text-nexus-green rounded transition-colors"
                                            >
                                                + Add Material
                                            </button>
                                        )}

                                        {isAddingMaterial === chapter._id && (
                                            <form onSubmit={handleMaterialSubmit} className="bg-gray-900/50 p-4 rounded border border-gray-700 space-y-3">
                                                <h5 className="text-sm font-bold text-white">
                                                    {editingMaterialIndex !== null ? 'Edit Material' : 'Add New Material'}
                                                </h5>
                                                <input
                                                    type="text"
                                                    placeholder="Material Title"
                                                    className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white"
                                                    value={materialForm.title}
                                                    onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <div className="w-1/2">
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
                                                    </div>
                                                    <div className="w-1/2">
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
                                                </div>

                                                {materialForm.type === 'link' ? (
                                                    <input
                                                        type="url"
                                                        placeholder="https://..."
                                                        className="w-full bg-black border border-gray-700 rounded p-2 text-sm text-white"
                                                        value={materialForm.url}
                                                        onChange={e => setMaterialForm({ ...materialForm, url: e.target.value })}
                                                        required
                                                    />
                                                ) : (
                                                    <div className="space-y-2">
                                                        {editingMaterialIndex !== null && materialForm.url && (
                                                            <div className="text-xs text-gray-400 bg-black/40 p-2 rounded border border-dashed border-gray-700 flex items-center gap-2">
                                                                <Icon icon="mdi:check-circle" className="text-nexus-green" />
                                                                <span className="truncate flex-1">Current File: {materialForm.url.split('/').pop()}</span>
                                                                <a href={materialForm.url} target="_blank" rel="noopener noreferrer" className="text-nexus-green hover:underline">View</a>
                                                            </div>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="w-full text-sm text-gray-400"
                                                            onChange={e => setMaterialForm({ ...materialForm, file: e.target.files?.[0] || null })}
                                                            required={editingMaterialIndex === null} // Only required if adding new
                                                        />
                                                        {editingMaterialIndex !== null && <p className="text-[10px] text-gray-500">Leave empty to keep existing file</p>}
                                                        {uploadProgress > 0 && <div className="text-xs text-nexus-green mt-1">Uploading: {uploadProgress}%</div>}
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button type="button" onClick={() => setIsAddingMaterial(null)} className="text-gray-400 text-sm">Cancel</button>
                                                    <button type="submit" className="bg-nexus-green text-black text-sm px-4 py-1.5 rounded font-bold">
                                                        {editingMaterialIndex !== null ? 'Update' : 'Add'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

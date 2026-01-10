import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import ChapterManager from '../components/course/ChapterManager';
import { useToast } from '../context/ToastContext';
import { FullScreenLoader } from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { MAJORS } from '../constants/onboarding';
import Select from '../components/ui/Select';
import { useTranslation } from 'react-i18next';
import { Input } from '../components/ui/Input';

type Tutor = {
    _id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string;
};

export default function CourseEditor() {
    const { id: routeId } = useParams();
    const id = routeId || 'create';
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'packages' | 'gamification' | 'curriculum'>('info');

    const [course, setCourse] = useState<any>(null);
    const [chapters, setChapters] = useState<any[]>([]);
    const [tutors, setTutors] = useState<Tutor[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'general', // 'university' | 'general'
        major: '',
        category: '',
        level: 'Beginner',
        status: 'ongoing',
        tutor_id: '',
        total_duration: '',
        packages: {
            basic: { price: 0, features: ['Access to course videos'] },
            advanced: { price: 0, features: ['Access to course videos', 'Downloadable resources'] },
            premium: { price: 0, features: ['Access to course videos', 'Downloadable resources', '1-on-1 Coaching'] }
        },
        completion_xp_bonus: 100,
        reward_avatar_id: ''
    });

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [avatars, setAvatars] = useState<any[]>([]);

    const isReadOnly = user?.role !== 'admin';

    useEffect(() => {
        if (user && !['admin', 'tutor'].includes(user.role)) {
            showToast('Unauthorized access.', 'error');
            navigate('/dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                const [tutorsRes, avatarsRes] = await Promise.all([
                    api.get('/user/tutors-list'),
                    api.get('/user/admin/avatars-list')
                ]);

                setTutors(tutorsRes.data);
                setAvatars(avatarsRes.data);

                if (id && id !== 'create') {
                    const { data } = await api.get(`/courses/${id}/edit`);
                    setCourse(data.course);
                    setChapters(data.chapters);

                    setFormData({
                        title: data.course.title || '',
                        description: data.course.description || '',
                        type: data.course.type || 'general',
                        major: data.course.major || '',
                        category: data.course.category || '',
                        level: data.course.level || 'Beginner',
                        status: data.course.status || 'ongoing',
                        tutor_id: data.course.tutor_id || '',
                        total_duration: data.course.total_duration || '',
                        packages: data.course.packages || {
                            basic: { price: 0, features: ['Access to course videos'] },
                            advanced: { price: 0, features: ['Access to course videos', 'Downloadable resources'] },
                            premium: { price: 0, features: ['Access to course videos', 'Downloadable resources', '1-on-1 Coaching'] }
                        },
                        completion_xp_bonus: data.course.completion_xp_bonus || 100,
                        reward_avatar_id: data.course.reward_avatar_id || '',

                    });
                    setPreviewUrl(data.course.thumbnail_url || '');
                }
            } catch (error) {
                console.error("Failed to load data", error);
                showToast('Failed to load course data', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();
    }, [id, user, navigate, showToast]);

    const handlePackageChange = (tier: 'basic' | 'advanced' | 'premium', field: 'price' | 'features', value: string | number) => {
        setFormData(prev => ({
            ...prev,
            packages: {
                ...prev.packages,
                [tier]: {
                    ...prev.packages[tier],
                    [field]: field === 'features' ? (value as string).split('\n') : Number(value)
                }
            }
        }));
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('type', formData.type);
            if (formData.type === 'university') data.append('major', formData.major);
            if (formData.type === 'general') data.append('category', formData.category);
            data.append('level', formData.level);
            data.append('status', formData.status);
            data.append('tutor_id', formData.tutor_id);
            data.append('total_duration', formData.total_duration);
            data.append('completion_xp_bonus', String(formData.completion_xp_bonus));
            data.append('reward_avatar_id', formData.reward_avatar_id);
            data.append('packages', JSON.stringify(formData.packages));

            if (thumbnailFile) {
                data.append('thumbnail', thumbnailFile);
            }

            if (id === 'create') {
                const { data: resData } = await api.post('/courses', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Course created successfully!', 'success');
                navigate(`/admin/courses/${resData._id}/edit`, { replace: true });
            } else {
                await api.put(`/courses/${id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showToast('Course updated successfully', 'success');
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to save', 'error');
        } finally {
            setSaving(false);
        }
    };

    const majorOptions = MAJORS.map(m => ({
        label: t(`onboarding.${m.labelKey}`),
        value: m.value,
        icon: m.icon
    }));

    const tutorOptions = tutors.map(t => ({
        label: `${t.first_name} ${t.last_name} (${t.username})`,
        value: t._id,
        icon: 'mdi:account'
    }));

    const levelOptions = [
        { label: 'Beginner', value: 'Beginner', icon: 'mdi:stairs-up' },
        { label: 'Intermediate', value: 'Intermediate', icon: 'mdi:stairs' },
        { label: 'Advanced', value: 'Advanced', icon: 'mdi:stairs-down' }
    ];

    const statusOptions = [
        { label: 'Ongoing (In Development)', value: 'ongoing', icon: 'mdi:pencil-outline' },
        { label: 'Complete (Published)', value: 'complete', icon: 'mdi:check-circle-outline' },
        { label: 'Disabled (Hidden)', value: 'disabled', icon: 'mdi:eye-off-outline' }
    ];

    const avatarOptions = avatars.map(a => ({
        label: a.name,
        value: a._id,
        icon: 'mdi:account-circle'
    }));

    if (loading) return <FullScreenLoader />;

    return (
        <div className="min-h-screen bg-nexus-black font-sans text-nexus-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-nexus-green/5 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div>
                        <button onClick={() => navigate('/admin')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 transition-colors group">
                            <div className="p-1 rounded bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Icon icon="mdi:chevron-left" />
                            </div>
                            Back to Dashboard
                        </button>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white to-gray-400">
                                {id === 'create' ? 'Create New Course' : course?.title}
                            </h1>
                            {id !== 'create' && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${formData.status === 'complete' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    formData.status === 'disabled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {statusOptions.find(s => s.value === formData.status)?.label.split('(')[0] || formData.status}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 w-fit">
                    {[
                        { id: 'info', label: 'Overview', icon: 'mdi:information-variant' },
                        { id: 'packages', label: 'Pricing & Features', icon: 'mdi:tag-text' },
                        { id: 'gamification', label: 'Rewards', icon: 'mdi:trophy' },
                        { id: 'curriculum', label: 'Curriculum Content', icon: 'mdi:book-open-page-variant', disabled: id === 'create' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            disabled={tab.disabled}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative ${activeTab === tab.id
                                ? 'text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabCourseEditor"
                                    className="absolute inset-0 bg-nexus-green rounded-lg"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon icon={tab.icon} className="text-lg" /> {tab.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'info' && (
                            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-nexus-card border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <Icon icon="mdi:card-text-outline" className="text-nexus-green" />
                                            Course Details
                                        </h3>

                                        <Input
                                            label="Course Title"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Mastering Advanced React Patterns"
                                            required
                                            disabled={isReadOnly}
                                        />

                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 ml-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full bg-nexus-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none h-40 resize-none transition-all placeholder-gray-600 font-medium leading-relaxed"
                                                placeholder="Describe what students will learn..."
                                                required
                                                disabled={isReadOnly}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="Total Duration"
                                                value={formData.total_duration}
                                                onChange={e => setFormData({ ...formData, total_duration: e.target.value })}
                                                placeholder="e.g. 10 Hours 30 Mins"
                                                disabled={isReadOnly}
                                                startIcon={<Icon icon="mdi:clock-time-four-outline" />}
                                            />

                                            {/* Type Selection */}
                                            <div className="space-y-2">
                                                <label className="block text-xs uppercase font-bold text-gray-500 ml-1">Course Type</label>
                                                <div className="bg-black/30 p-1.5 rounded-xl border border-white/10 flex">
                                                    {[
                                                        { val: 'general', label: 'General Course', icon: 'mdi:earth' },
                                                        { val: 'university', label: 'University', icon: 'mdi:school' }
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.val}
                                                            type="button"
                                                            onClick={() => !isReadOnly && setFormData({ ...formData, type: opt.val as any })}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${formData.type === opt.val
                                                                ? 'bg-nexus-green text-black shadow-lg'
                                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                                }`}
                                                            disabled={isReadOnly}
                                                        >
                                                            <Icon icon={opt.icon} /> {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {formData.type === 'university' ? (
                                                <Select
                                                    label="Major"
                                                    options={majorOptions}
                                                    value={formData.major}
                                                    onChange={(val) => setFormData({ ...formData, major: val })}
                                                    placeholder={t('onboarding.selectMajor')}
                                                    className="w-full"
                                                />
                                            ) : (
                                                <Input
                                                    label="Category"
                                                    value={formData.category}
                                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                    placeholder="e.g. Web Development"
                                                    required
                                                    disabled={isReadOnly}
                                                    startIcon={<Icon icon="mdi:tag" />}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-nexus-card border border-white/5 rounded-2xl p-6 space-y-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Icon icon="mdi:tune" className="text-nexus-green" />
                                            Settings
                                        </h3>

                                        <Select
                                            label="Assigned Tutor"
                                            options={tutorOptions}
                                            value={formData.tutor_id}
                                            onChange={(val) => setFormData({ ...formData, tutor_id: val })}
                                            placeholder="Select a Tutor..."
                                        />

                                        <Select
                                            label="Difficulty Level"
                                            options={levelOptions}
                                            value={formData.level}
                                            onChange={(val) => setFormData({ ...formData, level: val })}
                                            placeholder="Select Level"
                                        />

                                        <Select
                                            label="Course Status"
                                            options={statusOptions}
                                            value={formData.status}
                                            onChange={(val) => setFormData({ ...formData, status: val })}
                                            placeholder="Select Status"
                                        />

                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 ml-1">Thumbnail</label>
                                            <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/40 aspect-video">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                                        <Icon icon="mdi:image-plus" className="text-4xl mb-2 opacity-50" />
                                                        <span className="text-xs">Upload Image</span>
                                                    </div>
                                                )}

                                                {!isReadOnly && (
                                                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-sm">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleThumbnailChange}
                                                            className="hidden"
                                                        />
                                                        <span className="text-white font-bold flex items-center gap-2">
                                                            <Icon icon="mdi:camera" /> Change Thumbnail
                                                        </span>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {!isReadOnly && (
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-nexus-green text-black py-4 rounded-xl font-bold text-lg hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {saving ? <Icon icon="eos-icons:loading" className="animate-spin" /> : <Icon icon="mdi:check-circle" />}
                                            {id === 'create' ? 'Create Course' : 'Save Changes'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        )}

                        {activeTab === 'packages' && (
                            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Basic */}
                                <div className="bg-nexus-card border border-white/10 p-6 rounded-2xl flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Icon icon="mdi:check-circle-outline" className="text-gray-400" /> Basic
                                    </h3>

                                    <div className="space-y-6 flex-1">
                                        <Input
                                            label="Price ($)"
                                            type="number"
                                            value={formData.packages.basic.price}
                                            onChange={e => handlePackageChange('basic', 'price', e.target.value)}
                                            min="0"
                                            disabled={isReadOnly}
                                            startIcon={<Icon icon="mdi:currency-usd" />}
                                        />
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 ml-1">Features (One per line)</label>
                                            <textarea
                                                value={formData.packages.basic.features.join('\n')}
                                                onChange={e => handlePackageChange('basic', 'features', e.target.value)}
                                                className="w-full bg-nexus-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-nexus-green outline-none h-40 text-sm leading-relaxed resize-none"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced */}
                                <div className="bg-nexus-card border border-nexus-green/30 p-6 rounded-2xl flex flex-col relative overflow-hidden group">
                                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-nexus-green to-transparent opacity-50"></div>
                                    <h3 className="text-xl font-bold text-nexus-green mb-6 flex items-center gap-2">
                                        <Icon icon="mdi:star" /> Advanced
                                    </h3>

                                    <div className="space-y-6 flex-1 relative z-10">
                                        <Input
                                            label="Price ($)"
                                            type="number"
                                            value={formData.packages.advanced.price}
                                            onChange={e => handlePackageChange('advanced', 'price', e.target.value)}
                                            min="0"
                                            disabled={isReadOnly}
                                            startIcon={<Icon icon="mdi:currency-usd" />}
                                            className="border-nexus-green/30 focus:border-nexus-green"
                                        />
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 ml-1">Features (One per line)</label>
                                            <textarea
                                                value={formData.packages.advanced.features.join('\n')}
                                                onChange={e => handlePackageChange('advanced', 'features', e.target.value)}
                                                className="w-full bg-nexus-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-nexus-green outline-none h-40 text-sm leading-relaxed resize-none"
                                                disabled={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Premium */}
                                <div className="bg-gradient-to-br from-purple-900/10 to-nexus-black p-6 rounded-2xl border border-purple-500/30 flex flex-col relative overflow-hidden">
                                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-500/20 blur-[50px] rounded-full point-events-none"></div>
                                    <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                                        <Icon icon="mdi:crown" /> Premium
                                    </h3>

                                    <div className="space-y-6 flex-1 relative z-10">
                                        <Input
                                            label="Price ($)"
                                            type="number"
                                            value={formData.packages.premium.price}
                                            onChange={e => handlePackageChange('premium', 'price', e.target.value)}
                                            min="0"
                                            disabled={isReadOnly}
                                            startIcon={<Icon icon="mdi:currency-usd" />}
                                            className="border-purple-500/30 focus:border-purple-500"
                                        />
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-500 mb-1.5 ml-1">Features (One per line)</label>
                                            <textarea
                                                value={formData.packages.premium.features.join('\n')}
                                                onChange={e => handlePackageChange('premium', 'features', e.target.value)}
                                                className="w-full bg-nexus-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-purple-500 outline-none h-40 text-sm leading-relaxed resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {!isReadOnly && (
                                    <div className="md:col-span-3 flex justify-end">
                                        <button type="submit" className="bg-nexus-green text-black px-8 py-3 rounded-xl font-bold hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all">
                                            Save Pricing Models
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}

                        {activeTab === 'gamification' && (
                            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-nexus-card p-8 rounded-2xl border border-white/5 space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                            <Icon icon="mdi:controller-classic" className="text-nexus-green" />
                                            Rewards & Incentives
                                        </h3>
                                        <p className="text-gray-400 text-sm">Gamify the learning experience to boost completion rates.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                            <label className="block text-xs uppercase font-bold text-yellow-500 mb-2">Completion XP Bonus</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-500 text-2xl">
                                                    <Icon icon="mdi:lightning-bolt" />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={formData.completion_xp_bonus}
                                                    onChange={e => setFormData({ ...formData, completion_xp_bonus: Number(e.target.value) })}
                                                    className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono text-lg font-bold outline-none focus:border-yellow-500"
                                                    min="0"
                                                    disabled={isReadOnly}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                                            <label className="block text-xs uppercase font-bold text-purple-400 mb-2">Completion Avatar</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 text-2xl">
                                                    <Icon icon="mdi:gift" />
                                                </div>
                                                <div className="flex-1">
                                                    <Select
                                                        options={[{ label: 'No Avatar Reward', value: '' }, ...avatarOptions]}
                                                        value={formData.reward_avatar_id}
                                                        onChange={(val) => setFormData({ ...formData, reward_avatar_id: val })}
                                                        placeholder="Select Avatar..."
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {!isReadOnly && (
                                        <button type="submit" className="w-full bg-nexus-green text-black px-6 py-3 rounded-xl font-bold hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all">
                                            Save Settings
                                        </button>
                                    )}
                                </div>

                                <div className="bg-gradient-to-br from-nexus-green/20 to-transparent p-8 rounded-2xl border border-nexus-green/20 flex flex-col justify-center items-center text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-nexus-green/20 flex items-center justify-center mb-4 animate-pulse-slow">
                                        <Icon icon="mdi:trophy" className="text-5xl text-nexus-green" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white">Gamification Preview</h4>
                                    <p className="text-sm text-gray-300 max-w-xs">
                                        Students who complete this course will earn <strong className="text-yellow-400">{formData.completion_xp_bonus} XP</strong>
                                        {formData.reward_avatar_id && (
                                            <> and unlock the <strong className="text-purple-400">"{avatars.find(a => a._id === formData.reward_avatar_id)?.name}"</strong> avatar</>
                                        )}
                                        .
                                    </p>
                                </div>
                            </form>
                        )}

                        {activeTab === 'curriculum' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="max-w-5xl mx-auto"
                            >
                                <ChapterManager
                                    courseId={id!}
                                    chapters={chapters}
                                    onChapterAdded={(newChapter) => setChapters([...chapters, newChapter])}
                                    isReadOnly={isReadOnly}
                                />
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

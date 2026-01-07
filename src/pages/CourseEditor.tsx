import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import ChapterManager from '../components/course/ChapterManager';
// import Navbar from '../components/common/Navbar';
import { useToast } from '../context/ToastContext';
import { FullScreenLoader } from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import { Controller } from 'react-hook-form';
import { MAJORS } from '../constants/onboarding';
import Select from '../components/ui/Select';
import { useTranslation } from 'react-i18next';


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
        // Packages
        packages: {
            basic: { price: 0, features: ['Access to course videos'] },
            advanced: { price: 0, features: ['Access to course videos', 'Downloadable resources'] },
            premium: { price: 0, features: ['Access to course videos', 'Downloadable resources', '1-on-1 Coaching'] }
        },
        // Gamification
        completion_xp_bonus: 100,
        reward_avatar_id: ''
    });

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const [avatars, setAvatars] = useState<any[]>([]);

    useEffect(() => {
        // 1. Check Admin Access
        if (user && user.role !== 'admin') {
            showToast('Unauthorized. Admin access only.', 'error');
            navigate('/tutor-dashboard');
            return;
        }

        const fetchData = async () => {
            try {
                // 2. Fetch Tutors List & Avatars
                const [tutorsRes, avatarsRes] = await Promise.all([
                    api.get('/user/tutors-list'),
                    api.get('/user/admin/avatars-list')
                ]);

                setTutors(tutorsRes.data);
                setAvatars(avatarsRes.data);

                // 3. Fetch Course if Edit Mode
                if (id && id !== 'create') {
                    const { data } = await api.get(`/courses/${id}/edit`);
                    setCourse(data.course);
                    setChapters(data.chapters);

                    // Populate Form
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

        if (user) fetchData(); // Only fetch if user is loaded



    }, [id, user, navigate, showToast]);

    const handlePackageChange = (tier: 'basic' | 'advanced' | 'premium', field: 'price' | 'features', value: any) => {
        setFormData(prev => ({
            ...prev,
            packages: {
                ...prev.packages,
                [tier]: {
                    ...prev.packages[tier],
                    [field]: field === 'features' ? value.split('\n') : Number(value)
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
            // Append packages as JSON string
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
        { label: 'Complete (Published)', value: 'complete', icon: 'mdi:check-circle-outline' }
    ];

    const avatarOptions = avatars.map(a => ({
        label: a.name,
        value: a._id,
        icon: 'mdi:account-circle'
    }));


    if (loading) return <FullScreenLoader />;

    return (
        <div className="min-h-screen bg-nexus-black font-sans text-nexus-white">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <button onClick={() => navigate('/admin')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 mb-2">
                            <Icon icon="mdi:arrow-left" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold">{id === 'create' ? 'Create New Course' : `Edit: ${course?.title}`}</h1>
                        {id !== 'create' && <span className={`text-xs px-2 py-0.5 rounded ml-2 ${formData.status === 'complete' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>{formData.status}</span>}
                    </div>
                </div>

                <div className="flex gap-4 mb-8 border-b border-gray-800 overflow-x-auto">
                    {[
                        { id: 'info', label: 'Basic Info', icon: 'mdi:information-outline' },
                        { id: 'packages', label: 'Packages', icon: 'mdi:tag-outline' },
                        { id: 'gamification', label: 'Gamification', icon: 'mdi:trophy-outline' },
                        { id: 'curriculum', label: 'Curriculum', icon: 'mdi:format-list-bulleted', disabled: id === 'create' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            disabled={tab.disabled}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap 
                                ${activeTab === tab.id
                                    ? 'border-nexus-green text-nexus-green'
                                    : 'border-transparent text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        >
                            <Icon icon={tab.icon} /> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="bg-nexus-card rounded-xl border border-white/5 p-6 md:p-8">
                    {activeTab === 'info' && (
                        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-4">Details</h3>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Course Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none h-32"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Total Duration</label>
                                        <input
                                            type="text"
                                            value={formData.total_duration}
                                            onChange={e => setFormData({ ...formData, total_duration: e.target.value })}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                            placeholder="e.g. 10 Hours 30 Mins"
                                        />
                                    </div>

                                    {/* Type Selection */}
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Course Type</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="university"
                                                    checked={formData.type === 'university'}
                                                    onChange={e => setFormData({ ...formData, type: 'university' })}
                                                    className="accent-nexus-green"
                                                /> University
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="type"
                                                    value="general"
                                                    checked={formData.type === 'general'}
                                                    onChange={e => setFormData({ ...formData, type: 'general' })}
                                                    className="accent-nexus-green"
                                                /> General
                                            </label>
                                        </div>
                                    </div>

                                    {formData.type === 'university' ? (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Major</label>
                                            <Select
                                                options={majorOptions}
                                                value={formData.major}
                                                onChange={(val) => setFormData({ ...formData, major: val })}
                                                placeholder={t('onboarding.selectMajor')}
                                                className="w-full"
                                            />
                                        </div>

                                    ) : (
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                                            <input
                                                type="text"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                                placeholder="e.g. Web Development"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-4">Settings</h3>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Assigned Tutor</label>
                                        <Select
                                            options={tutorOptions}
                                            value={formData.tutor_id}
                                            onChange={(val) => setFormData({ ...formData, tutor_id: val })}
                                            placeholder="Select a Tutor..."
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Difficulty Level</label>
                                        <Select
                                            options={levelOptions}
                                            value={formData.level}
                                            onChange={(val) => setFormData({ ...formData, level: val })}
                                            placeholder="Select Level"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Course Status</label>
                                        <Select
                                            options={statusOptions}
                                            value={formData.status}
                                            onChange={(val) => setFormData({ ...formData, status: val })}
                                            placeholder="Select Status"
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Thumbnail Image</label>
                                        <div className="flex items-center gap-4">
                                            {previewUrl && (
                                                <img
                                                    src={previewUrl}
                                                    alt="Thumbnail Preview"
                                                    className="w-20 h-14 object-cover rounded border border-gray-700"
                                                />
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleThumbnailChange}
                                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                                required={id === 'create'}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Uploaded to Cloudinary (Folder: Thumbnails)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-nexus-green text-black px-6 py-3 rounded-lg font-bold hover:bg-nexus-green/90 transition-all w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving && <Icon icon="eos-icons:loading" className="animate-spin" />}
                                    {id === 'create' ? 'Create Course' : 'Save Details'}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'packages' && (
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Basic */}
                                <div className="bg-black/20 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">Basic</h3>
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-400 mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            value={formData.packages.basic.price}
                                            onChange={e => handlePackageChange('basic', 'price', e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Features (One per line)</label>
                                        <textarea
                                            value={formData.packages.basic.features.join('\n')}
                                            onChange={e => handlePackageChange('basic', 'features', e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none h-40 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Advanced */}
                                <div className="bg-black/20 p-4 rounded-lg border border-gray-700 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-nexus-green text-black text-xs px-2 py-0.5 font-bold">Recommended</div>
                                    <h3 className="text-xl font-bold text-nexus-green mb-4 border-b border-gray-700 pb-2">Advanced</h3>
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-400 mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            value={formData.packages.advanced.price}
                                            onChange={e => handlePackageChange('advanced', 'price', e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Features (One per line)</label>
                                        <textarea
                                            value={formData.packages.advanced.features.join('\n')}
                                            onChange={e => handlePackageChange('advanced', 'features', e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none h-40 text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Premium */}
                                <div className="bg-gradient-to-br from-purple-900/10 to-transparent p-4 rounded-lg border border-purple-500/30">
                                    <h3 className="text-xl font-bold text-purple-400 mb-4 border-b border-gray-700 pb-2">Premium</h3>
                                    <div className="mb-4">
                                        <label className="block text-xs text-gray-400 mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            value={formData.packages.premium.price}
                                            onChange={e => handlePackageChange('premium', 'price', e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">Features (One per line)</label>
                                        <textarea
                                            value={formData.packages.premium.features.join('\n')}
                                            onChange={e => handlePackageChange('premium', 'features', e.target.value)}
                                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none h-40 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <button type="submit" className="bg-nexus-green text-black px-6 py-3 rounded-lg font-bold hover:bg-nexus-green/90 transition-all">
                                    Save Packages
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'gamification' && (
                        <form onSubmit={handleSave} className="max-w-xl space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Rewards & XP</h3>
                                <p className="text-gray-400 text-sm mb-6">Configure what students earn upon completion.</p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Completion XP Bonus</label>
                                        <div className="flex items-center gap-2">
                                            <Icon icon="mdi:lightning-bolt" className="text-yellow-400" />
                                            <input
                                                type="number"
                                                value={formData.completion_xp_bonus}
                                                onChange={e => setFormData({ ...formData, completion_xp_bonus: Number(e.target.value) })}
                                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white focus:border-nexus-green outline-none"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Reward Avatar (Optional)</label>
                                        <div className="flex items-center gap-2">
                                            <Icon icon="mdi:gift" className="text-purple-400" />
                                            <Select
                                                options={[{ label: 'None', value: '' }, ...avatarOptions]}
                                                value={formData.reward_avatar_id}
                                                onChange={(val) => setFormData({ ...formData, reward_avatar_id: val })}
                                                placeholder="Select Reward Avatar..."
                                                className="w-full"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Users will unlock this avatar when they finish the course.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <button type="submit" className="bg-nexus-green text-black px-6 py-3 rounded-lg font-bold hover:bg-nexus-green/90 transition-all">
                                    Save Gamification Settings
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="max-w-4xl">
                            <ChapterManager
                                courseId={id!}
                                chapters={chapters}
                                onChapterAdded={(newChapter) => setChapters([...chapters, newChapter])}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

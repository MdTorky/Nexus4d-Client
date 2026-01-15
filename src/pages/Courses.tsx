import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import type { Course } from '../types';
import CourseCard from '../components/course/CourseCard';
import { FullScreenLoader } from '../components/ui/Loader';
import { MAJORS } from '../constants/onboarding';
import Select from '../components/ui/Select';
import { useTranslation } from 'react-i18next';

export default function Courses() {
    const { t } = useTranslation();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'university' | 'general'>('all');
    const [selectedMajor, setSelectedMajor] = useState<string>('');
    // const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        // 1. Search
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Tab Filter
        const matchesTab = activeTab === 'all'
            ? true
            : activeTab === 'university'
                ? course.type === 'university'
                : course.type === 'general';

        // 3. Sub-Filters
        let matchesSubFilter = true;
        if (activeTab === 'university' && selectedMajor) {
            matchesSubFilter = course.major === selectedMajor;
        }
        // Add category filter logic later if categories are standardized

        return matchesSearch && matchesTab && matchesSubFilter;
    });

    if (loading) return <FullScreenLoader />;

    return (
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-nexus-green/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {/* <div className="p-2 bg-nexus-green/10 rounded-lg">
                                <Icon icon="mdi:compass-outline" className="text-nexus-green text-2xl" />
                            </div> */}
                            <span className="text-nexus-green font-bold tracking-wider uppercase text-sm">{t('courses.header.subtitle')}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            {t('courses.header.title1')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green to-white">{t('courses.header.title2')}</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative w-full md:w-96"
                    >
                        <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-nexus-green transition-colors" width="24" />
                        <input
                            type="text"
                            placeholder={t('courses.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-nexus-green focus:ring-1 focus:ring-nexus-green/50 focus:outline-none transition-all shadow-lg backdrop-blur-sm"
                        />
                    </motion.div>
                </div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-1 border-b border-white/5 pb-8"
                >
                    {/* Tabs */}
                    <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl backdrop-blur-md border border-white/5">
                        {(['all', 'university', 'general'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setSelectedMajor(''); }}
                                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all relative overflow-hidden ${activeTab === tab
                                    ? 'text-black shadow-lg shadow-nexus-green/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-nexus-green z-0"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{t(`courses.tabs.${tab}`)}</span>
                            </button>
                        ))}
                    </div>

                    {/* Secondary Filter (Major) */}
                    {activeTab === 'university' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full sm:w-72"
                        >
                            <Select
                                options={[
                                    { label: t('courses.filters.allMajors'), value: "", icon: "mdi:all-inclusive" },
                                    ...MAJORS.map(m => ({ label: t(`onboarding.${m.labelKey}`) || m.value, value: m.value, icon: m.icon }))
                                ]}
                                value={selectedMajor}
                                onChange={setSelectedMajor}
                                placeholder={t('courses.filters.filterByMajor')}
                                className="w-full"
                            />
                        </motion.div>
                    )}
                </motion.div>

                {/* Grid */}
                {filteredCourses.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <CourseCard course={course} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5"
                    >
                        <div className="bg-white/5 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                            <Icon icon="mdi:database-off" className="text-gray-500" width="48" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{t('courses.emptyState.title')}</h3>
                        <p className="text-gray-400 max-w-md mx-auto">{t('courses.emptyState.message')}</p>
                        <button
                            onClick={() => { setActiveTab('all'); setSearchQuery(''); setSelectedMajor(''); }}
                            className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-nexus-green font-bold rounded-xl transition-all border border-nexus-green/20 hover:border-nexus-green/50"
                        >
                            {t('courses.emptyState.reset')}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

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
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Explore Courses</h1>
                        <p className="text-gray-400">Find the perfect course to level up your skills.</p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="20" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-gray-700 rounded-full py-2.5 pl-10 pr-4 text-white focus:border-nexus-green focus:outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-4">
                    {/* Tabs */}
                    <div className="flex bg-black/30 p-1 rounded-lg">
                        {(['all', 'university', 'general'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setSelectedMajor(''); }}
                                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-nexus-green text-black shadow-lg shadow-nexus-green/20'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Secondary Filter (Major) */}
                    {activeTab === 'university' && (
                        <div className="w-full sm:w-64">
                            <Select
                                options={[
                                    { label: "All Majors", value: "", icon: "mdi:all-inclusive" },
                                    ...MAJORS.map(m => ({ label: t(`onboarding.${m.labelKey}`) || m.value, value: m.value, icon: m.icon }))
                                ]}
                                value={selectedMajor}
                                onChange={setSelectedMajor}
                                placeholder="Filter by Major"
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

                {/* Grid */}
                {filteredCourses.length > 0 ? (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredCourses.map((course) => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-gray-900/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:school-off" className="text-gray-600" width="40" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search query.</p>
                        <button
                            onClick={() => { setActiveTab('all'); setSearchQuery(''); setSelectedMajor(''); }}
                            className="mt-6 text-nexus-green hover:underline cursor-pointer"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Loader } from '../ui/Loader';

interface Course {
    _id: string;
    title: string;
    thumbnail_url: string;
    status: 'ongoing' | 'complete';
    enrolled_students: number;
}

export default function CourseList() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader text="Loading Courses" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full max-w-md group">
                    <div className="absolute inset-0 bg-nexus-green/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <Icon icon="mdi:magnify" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-nexus-green transition-colors" />
                    <input
                        type="text"
                        placeholder="Search courses by title or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#09090b]/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 outline-none focus:border-nexus-green/50 focus:ring-1 focus:ring-nexus-green/50 backdrop-blur-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/admin/courses/create" className="px-5 py-2.5 bg-nexus-green hover:bg-green-400 text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-green-900/20">
                        <Icon icon="mdi:plus-circle" className="text-xl" />
                        Create Course
                    </Link>
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-nexus-card/30 rounded-2xl border border-white/5 border-dashed">
                    <Icon icon="mdi:book-open-page-variant-outline" className="mx-auto text-6xl text-gray-600 mb-4" />
                    <p className="text-gray-500">No courses found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-[#09090b] rounded-2xl overflow-hidden border border-white/10 hover:border-nexus-green/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-nexus-green/10"
                            >
                                <div className="aspect-video w-full overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
                                    <img
                                        src={course.thumbnail_url || '/placeholder_course.jpg'}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-3 right-3 z-20">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${course.status === 'complete'
                                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                            : course.status === 'ongoing' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-nexus-green transition-colors">{course.title}</h3>

                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                                        <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded">
                                            <Icon icon="mdi:account-school" className="text-nexus-green" />
                                            <span className="text-white font-bold">{course.enrolled_students}</span> Students
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                        <Link
                                            to={`/admin/courses/${course._id}/edit`}
                                            className="flex-1 px-3 py-2 bg-white/5 hover:bg-nexus-green hover:text-black hover:font-bold text-gray-300 text-sm rounded-lg transition-all flex items-center justify-center gap-2 group/btn"
                                        >
                                            <Icon icon="mdi:cog" className="group-hover/btn:rotate-90 transition-transform" />
                                            Manage Course
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

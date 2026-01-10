import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import { FullScreenLoader } from '../components/ui/Loader';

interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    price: number;
    enrolled_students: number;
    status: 'draft' | 'published';
}

export default function TutorDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses/tutor/my-courses');
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Derived Stats
    const totalStudents = courses.reduce((acc, course) => acc + (course.enrolled_students || 0), 0);
    const activeCourses = courses.filter(c => c.status === 'published').length;

    // const lowestPrice = courses.packages ? Math.min(
    //     courses.packages.basic?.price || 0,
    //     courses.packages.advanced?.price || 0,
    //     courses.packages.premium?.price || 0
    // ) : 0;

    if (loading) return <FullScreenLoader />;

    return (
        <div className="min-h-screen bg-nexus-black relative overflow-hidden font-sans text-nexus-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] bg-nexus-green/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-4"
                        >
                            <Icon icon="mdi:console-network" className="text-nexus-green" />
                            Command Center
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 mt-2 font-medium tracking-wide"
                        >
                            Operational Overview & Mission Control
                        </motion.p>
                    </div>
                </div>

                {/* Holographic Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Students */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon icon="mdi:account-group" className="text-5xl text-blue-500" />
                        </div>
                        <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">Total Cadets</p>
                        <p className="text-4xl font-black text-white">{totalStudents.toLocaleString()}</p>
                        <div className="w-full bg-gray-800 h-1 mt-4 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </div>
                    </motion.div>

                    {/* Active Courses */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-nexus-green/30 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon icon="mdi:broadcast" className="text-5xl text-nexus-green" />
                        </div>
                        <p className="text-xs text-nexus-green font-bold uppercase tracking-widest mb-1">Active Missions</p>
                        <p className="text-4xl font-black text-white">{activeCourses} <span className="text-lg text-gray-500 font-bold">/ {courses.length}</span></p>
                        <div className="flex gap-1 mt-4">
                            {courses.map((c, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scaleY: 0 }}
                                    animate={{ opacity: 1, scaleY: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className={`flex-1 h-1 rounded-full ${c.status === 'published' ? 'bg-nexus-green shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* System Status (Static for now, could be assignments later) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Icon icon="mdi:server-network" className="text-5xl text-purple-500" />
                        </div>
                        <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-1">System Status</p>
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexus-green opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-nexus-green"></span>
                            </div>
                            <p className="text-lg font-bold text-white uppercase tracking-wide">Online</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-mono">NODE_ENV: PRODUCTION</p>
                    </motion.div>
                </div>

                {/* Assignments List */}
                <div>
                    <div className="flex items-center gap-3 mb-8">
                        <Icon icon="mdi:folder-multiple-outline" className="text-2xl text-nexus-green" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Assigned Missions</h2>
                    </div>

                    {courses.length === 0 ? (
                        <div className="bg-black/20 border border-dashed border-white/10 rounded-3xl p-12 text-center">
                            <Icon icon="mdi:radar-off" className="text-6xl text-gray-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide mb-2">No Active Assignments</h3>
                            <p className="text-gray-500">Stand by for new directives from command.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map((course, index) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group relative bg-black/40 border border-white/10 rounded-3xl overflow-hidden hover:border-nexus-green/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] hover:-translate-y-1"
                                >
                                    {/* Thumbnail Area */}
                                    <div className="relative aspect-video w-full overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opactiy-60" />
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${course.status === 'published'
                                                ? 'bg-nexus-green/20 text-nexus-green border-nexus-green/30'
                                                : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
                                                }`}>
                                                {course.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-nexus-green transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10">
                                            {course.description}
                                        </p>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-2 gap-4 mb-6 border-t border-white/5 pt-4">
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Cadets</p>
                                                <div className="flex items-center gap-1.5 text-white font-bold">
                                                    <Icon icon="mdi:account" className="text-blue-500 text-xs" />
                                                    {course.enrolled_students}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Revenue</p>
                                                <div className="flex items-center gap-1.5 text-white font-bold">
                                                    <Icon icon="mdi:currency-usd" className="text-nexus-green text-xs" />
                                                    {course.price > 0 ? course.price : 'FREE'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <Link
                                            to={`/courses/${course._id}`} // Or a dedicated tutor view if needed, but courses/:id is fine for now
                                            className="w-full bg-white/5 hover:bg-nexus-green hover:text-black text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs border border-white/5 group-hover:border-nexus-green/50"
                                        >
                                            <Icon icon="mdi:eye-outline" className="text-lg" />
                                            Inspect Mission
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

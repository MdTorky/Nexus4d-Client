import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import { FullScreenLoader } from '../components/ui/Loader';
import type { Enrollment as SharedEnrollment } from '../types';

export default function MyCourses() {
    const { t } = useTranslation();
    const [enrollments, setEnrollments] = useState<SharedEnrollment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const { data } = await api.get('/courses/my-courses');
            setEnrollments(data);
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <FullScreenLoader />;

    // Group enrollments for better organization (optional, but good for UI)
    const activeCourses = enrollments.filter(e => e.status === 'active' || e.status === 'completed');
    const pendingCourses = enrollments.filter(e => e.status === 'pending');
    const rejectedCourses = enrollments.filter(e => e.status === 'rejected');

    return (
        <div className="min-h-screen bg-nexus-black pt-28 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-nexus-green/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 mb-2 text-nexus-green font-bold uppercase tracking-widest text-xs"
                        >
                            <Icon icon="mdi:school-outline" className="text-lg" />
                            {t('myCourses.academicDashboard')}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter"
                        >
                            {t('myCourses.myMissions').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green to-blue-500">{t('myCourses.myMissions').split(' ').slice(1).join(' ')}</span>
                        </motion.h1>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-2 pr-6"
                    >
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-black text-white">{enrollments.length}</span>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t('myCourses.totalEnrollments')}</p>
                            <p className="text-xs text-white font-medium">{t('myCourses.acrossCategories')}</p>
                        </div>
                    </motion.div>
                </div>

                {enrollments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-24 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl backdrop-blur-sm relative overflow-hidden"
                    >
                        {/* Background Grid Pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                <Icon icon="mdi:folder-search-outline" className="text-gray-400 text-5xl" />
                            </div>
                            <h2 className="text-2xl text-white font-black mb-2 uppercase tracking-wide">{t('myCourses.noActiveMissions')}</h2>
                            <p className="text-gray-400 mb-8 max-w-md text-lg">{t('myCourses.emptyDashboard')}</p>
                            <Link
                                to="/courses"
                                className="bg-nexus-green text-black px-8 py-3 rounded-xl font-black hover:bg-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] inline-flex items-center gap-2 uppercase tracking-wider"
                            >
                                {t('myCourses.exploreCourses')} <Icon icon={`mdi:arrow-${i18n.language === "en" ? "right" : "left"}`} />
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-16">
                        {/* Active & Completed Section */}
                        <AnimatePresence>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...activeCourses, ...pendingCourses, ...rejectedCourses].map((enrollment, index) => {
                                    const course = enrollment.course_id as any;
                                    if (!course || !course.title) return null;

                                    return (
                                        <motion.div
                                            key={enrollment._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative bg-black/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm hover:border-nexus-green/30 hover:shadow-[0_0_40px_rgba(34,197,94,0.1)] transition-all duration-500 flex flex-col h-full"
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative h-56 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80" />
                                                <img
                                                    src={course.thumbnail_url}
                                                    alt={course.title}
                                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${enrollment.status !== 'active' && enrollment.status !== 'completed' ? 'grayscale opacity-60' : ''}`}
                                                />

                                                {/* Top Badge Overlay */}
                                                <div className="absolute top-4 left-4 z-20 flex gap-2">
                                                    <div className={`backdrop-blur-md text-black text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-lg ${enrollment.package === 'basic' ? 'bg-white' :
                                                        enrollment.package === 'advanced' ? 'bg-nexus-green' : 'bg-purple-400'
                                                        }`}>
                                                        <Icon icon={`${enrollment.package === 'basic' ? 'mdi:star-circle-outline' : enrollment.package === 'advanced' ? 'mdi:star-circle' : 'mdi:crown'}`} />
                                                        {enrollment.package} {t('myCourses.plan')}
                                                    </div>
                                                </div>

                                                {/* Status Overlay */}
                                                {enrollment.status === 'pending' && (
                                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-2 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                                            <Icon icon="mdi:clock-outline" /> {t('myCourses.pendingApproval')}
                                                        </div>
                                                    </div>
                                                )}
                                                {enrollment.status === 'rejected' && (
                                                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-xl flex items-center gap-2 font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                                                            <Icon icon="mdi:alert-circle" /> {t('myCourses.enrollmentRejected')}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex-1 flex flex-col relative z-20">
                                                <div className="mb-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-nexus-green text-[10px] font-black uppercase tracking-widest bg-nexus-green/10 px-2 py-1 rounded">
                                                            {course.major}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-nexus-green transition-colors line-clamp-2">
                                                        {course.title}
                                                    </h3>
                                                </div>

                                                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                                                    <div className="relative">
                                                        <img
                                                            src={course.tutor_id?.current_avatar_url || `https://ui-avatars.com/api/?name=${course.tutor_id?.username}&background=random`}
                                                            alt={course.tutor_id?.username}
                                                            className="w-8 h-8 rounded-full border border-white/20 object-cover"
                                                        />
                                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{t('myCourses.instructor')}</p>
                                                        <p className="text-xs text-white font-bold truncate">
                                                            {course.tutor_id?.first_name ? `${course.tutor_id.first_name} ${course.tutor_id.last_name}` : t('myCourses.unknown')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-4">
                                                    {(enrollment.status === 'active' || enrollment.status === 'completed') ? (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                                <span className="text-gray-400">{t('myCourses.missionProgress')}</span>
                                                                <span className={enrollment.progress === 100 ? 'text-nexus-green' : 'text-white'}>{enrollment.progress || 0}%</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ${enrollment.progress === 100 ? 'bg-nexus-green shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-blue-500'}`}
                                                                    style={{ width: `${enrollment.progress || 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white/5 rounded-lg p-3 text-xs text-gray-400 border border-white/5">
                                                            {enrollment.status === 'pending' && t('myCourses.accessPending')}
                                                            {enrollment.status === 'rejected' && (
                                                                <>
                                                                    <span className="text-red-400 font-bold block mb-1">{t('myCourses.reason')}</span>
                                                                    {enrollment.rejection_reason || t('myCourses.adminDecision')}
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Button */}
                                                    {(enrollment.status === 'active' || enrollment.status === 'completed') ? (
                                                        <Link
                                                            to={`/courses/${course._id}/learn`}
                                                            className="block w-full bg-white text-black font-black text-center py-3 rounded-xl hover:bg-nexus-green transition-all uppercase tracking-wider shadow-lg text-xs"
                                                        >
                                                            {enrollment.status === 'completed' ? t('myCourses.reEnterSim') : t('myCourses.continueMission')}
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            to={`/courses/${course._id}`}
                                                            className={`block w-full border text-center py-3 rounded-xl font-bold transition-all uppercase tracking-wider text-xs
                                                                ${enrollment.status === 'rejected'
                                                                    ? 'border-red-500/30 text-red-500 hover:bg-red-500/10'
                                                                    : 'border-white/10 text-gray-500 hover:text-white hover:bg-white/5'
                                                                }`}
                                                            onClick={(e) => {
                                                                if (enrollment.status === 'pending') e.preventDefault();
                                                            }}
                                                        >
                                                            {enrollment.status === 'pending' ? t('myCourses.locked') : t('myCourses.viewDetails')}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}

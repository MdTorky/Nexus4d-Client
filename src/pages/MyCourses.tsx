import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import { FullScreenLoader } from '../components/ui/Loader';
import type { Enrollment as SharedEnrollment } from '../types';

export default function MyCourses() {
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

    return (
        <div className="min-h-screen bg-nexus-black pt-24 px-4 sm:px-6 lg:px-8 pb-12">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Icon icon="mdi:school-outline" className="text-nexus-green text-4xl" />
                    <h1 className="text-3xl font-bold text-white">My Courses</h1>
                </div>

                {enrollments.length === 0 ? (
                    <div className="text-center py-20 bg-nexus-card border border-white/10 rounded-2xl">
                        <Icon icon="mdi:book-open-page-variant-outline" className="text-gray-600 text-6xl mx-auto mb-4" />
                        <h2 className="text-xl text-white font-bold mb-2">No Verified Courses Yet</h2>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">Enroll in a course to start your journey and unlock exclusive rewards.</p>
                        <Link to="/courses" className="bg-nexus-green text-black px-6 py-2 rounded-lg font-bold hover:bg-white transition-colors inline-flex items-center gap-2">
                            Explore Courses <Icon icon="mdi:arrow-right" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.map((enrollment) => {
                            // In the updated backend/types, populated course might be under `course_id`
                            // Check types.ts: UserCourse has `course_id`. If it's populated, it's an object.
                            // The `SharedEnrollment` interface in types.ts defines `course_id: string` but in practice it's likely populated.
                            // Wait, let's check `types.ts` again.
                            // `Enrollment` in types.ts says `course_id: string`.
                            // But `MyCourses` previously used `course_id: Course`. 
                            // This suggests the API returns populated data.
                            // I should cast it or trust the runtime data.
                            // The previous code used `const course = enrollment.course_id`.
                            // Let's assume it IS populated. I'll use `any` cast temporarily or update type if possible, 
                            // but for now let's just make it work like before.

                            const course = enrollment.course_id as any;

                            // Safe check if course is deleted but enrollment exists
                            if (!course || !course.title) return null;

                            return (
                                <motion.div
                                    key={enrollment._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-nexus-card border border-white/10 rounded-2xl overflow-hidden hover:border-nexus-green/30 transition-all group"
                                >
                                    <div className="relative aspect-video bg-black">
                                        <img
                                            src={course.thumbnail_url}
                                            alt={course.title}
                                            className={`w-full h-full object-cover transition-opacity ${enrollment.status === 'pending' ? 'opacity-50 grayscale' : 'opacity-80 group-hover:opacity-100'}`}
                                        />

                                        {/* Package Badge */}
                                        <div className={`absolute top-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded border border-white/20 capitalize flex items-center gap-1 ${enrollment.package === 'basic' ? '!text-white' : enrollment.package === 'advanced' ? '!text-nexus-green' : '!text-purple-400'}`}>
                                            <Icon icon={`${enrollment.package === 'basic' ? 'mdi:star-circle-outline' : enrollment.package === 'advanced' ? 'mdi:star-circle' : 'mdi:crown'}`} />
                                            {enrollment.package}
                                        </div>

                                        {/* Status Overlays */}
                                        {enrollment.status === 'pending' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                                <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-3 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm">
                                                    <Icon icon="mdi:clock-outline" /> Pending Approval
                                                </div>
                                            </div>
                                        )}
                                        {enrollment.status === 'rejected' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-3 py-1.5 rounded-full flex items-center gap-2 font-bold text-sm">
                                                    <Icon icon="mdi:alert-circle" /> Rejected
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{course.title}</h3>
                                            <p className="text-sm text-gray-400">
                                                By {course.tutor_id?.first_name ? `${course.tutor_id.first_name} ${course.tutor_id.last_name}` : 'Unknown Tutor'}
                                            </p>
                                        </div>

                                        {/* Progress Bar (Only for Active/Completed) */}
                                        {enrollment.status === 'active' || enrollment.status === 'completed' ? (
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                                    <span>Progress</span>
                                                    <span>{enrollment.progress || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-nexus-green transition-all duration-1000"
                                                        style={{ width: `${enrollment.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-500 py-2">
                                                {enrollment.status === 'pending'
                                                    ? 'Access will be granted once payment is verified.'
                                                    : enrollment.rejection_reason}
                                            </div>
                                        )}

                                        {/* Action Button */}
                                        {enrollment.status === 'active' || enrollment.status === 'completed' ? (
                                            <Link
                                                to={`/courses/${course._id}/learn`}
                                                className="block w-full bg-nexus-green text-black font-bold text-center py-2.5 rounded-lg hover:bg-white hover:text-black transition-all shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.5)]"
                                            >
                                                Continue Learning
                                            </Link>
                                        ) : (
                                            <Link
                                                to={`/courses/${course._id}`}
                                                className={`block w-full bg-white/5 border border-white/10 text-center py-2.5 rounded-lg font-bold transition-all
                                                    ${enrollment.status === 'rejected' ? 'text-red-400 hover:bg-red-500/10 border-red-500/30' : 'text-gray-500 cursor-default hover:bg-white/5'}
                                                `}
                                                onClick={(e) => {
                                                    if (enrollment.status === 'pending') e.preventDefault();
                                                }}
                                            >
                                                {enrollment.status === 'pending' ? 'Awaiting Approval' : 'View Options'}
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

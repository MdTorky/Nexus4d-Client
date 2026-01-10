import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import type { Course } from '../../types';

interface CourseCardProps {
    course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
    const navigate = useNavigate();

    const lowestPrice = course.packages ? Math.min(
        course.packages.basic?.price || 0,
        course.packages.advanced?.price || 0,
        course.packages.premium?.price || 0
    ) : 0;

    const isFree = lowestPrice === 0 || course.packages?.basic?.price === 0;

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => navigate(`/courses/${course._id}`)}
            className="group relative bg-black/40 border border-white/10 rounded-3xl overflow-hidden cursor-pointer flex flex-col h-full hover:border-nexus-green/50 hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] transition-all duration-500 backdrop-blur-sm"
        >
            {/* Thumbnail */}
            <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60" />
                <img
                    src={course.thumbnail_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Status Badges */}
                <div className="absolute top-3 right-3 z-20 flex gap-2">
                    {course.status === 'ongoing' && (
                        <span className="flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            In Progress
                        </span>
                    )}
                    {course.status === 'complete' && (
                        <span className="bg-nexus-green/20 text-nexus-green border border-nexus-green/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            Complete
                        </span>
                    )}
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 left-3 z-20">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/10 flex items-center gap-1">
                        <Icon icon={course.type === 'university' ? 'mdi:bank-outline' : 'mdi:school-outline'} className="text-nexus-green" />
                        {course.type === 'university' ? course.major : course.category || 'General'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1 relative z-10">
                <div className="mb-3">
                    <h3 className="text-xl font-black text-white leading-tight group-hover:text-nexus-green transition-colors line-clamp-2">
                        {course.title}
                    </h3>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                    {course.description}
                </p>

                {/* Footer Info */}
                <div className="space-y-4 pt-4 border-t border-white/5">

                    {/* Tutor */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={course.tutor_id?.current_avatar_url || `https://ui-avatars.com/api/?name=${course.tutor_id?.username}&background=random`}
                                alt={course.tutor_id?.username}
                                className="w-8 h-8 rounded-full border border-white/20 object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Instructor</p>
                            <p className="text-xs text-white font-bold">
                                {course.tutor_id?.first_name
                                    ? `${course.tutor_id.first_name} ${course.tutor_id.last_name}`
                                    : course.tutor_id?.username || 'Unknown Tutor'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Stats & Price */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-gray-400 text-xs font-medium">
                            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                <Icon icon="mdi:book-open-page-variant" className="text-nexus-green" />
                                {course.total_chapters || 0} Ch
                            </span>
                            {course.total_duration && (
                                <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                    <Icon icon="mdi:clock-outline" className="text-nexus-green" />
                                    {course.total_duration}
                                </span>
                            )}
                        </div>

                        <div className="font-bold text-sm">
                            {isFree ? (
                                <span className="text-nexus-green bg-nexus-green/10 px-3 py-1 rounded-lg border border-nexus-green/20">
                                    FREE ACCESS
                                </span>
                            ) : (
                                <span className="text-white bg-white/5 px-3 py-1 rounded-lg border border-white/10 group-hover:border-nexus-green/30 transition-colors">
                                    RM {lowestPrice}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

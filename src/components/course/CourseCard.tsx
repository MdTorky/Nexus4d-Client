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
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0, 255, 157, 0.2)' }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => navigate(`/courses/${course._id}`)}
            className="group bg-nexus-card border border-white/10 rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full hover:border-nexus-green/50 transition-colors"
        >
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={course.thumbnail_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                    {course.status === 'ongoing' && (
                        <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            Ongoing
                        </span>
                    )}
                    {course.status === 'complete' && (
                        <span className="bg-nexus-green/90 text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">
                            Complete
                        </span>
                    )}
                </div>
                <div className="absolute top-2 left-2">
                    <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border border-white/10">
                        {course.type === 'university' ? course.major : course.category || 'General'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-nexus-green transition-colors">
                        {course.title}
                    </h3>
                </div>

                <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                    {course.description}
                </p>

                {/* Footer Info */}
                <div className="space-y-3">
                    {/* Tutor */}
                    <div className="flex items-center gap-2">
                        <img
                            src={course.tutor_id?.current_avatar_url || `https://ui-avatars.com/api/?name=${course.tutor_id?.username}&background=random`}
                            alt={course.tutor_id?.username}
                            className="w-6 h-6 rounded-full border border-gray-600"
                        />
                        <span className="text-xs text-gray-300">
                            {course.tutor_id?.first_name
                                ? `${course.tutor_id.first_name} ${course.tutor_id.last_name}`
                                : course.tutor_id?.username || 'Unknown Tutor'
                            }
                        </span>
                    </div>

                    <div className="h-px w-full bg-white/5" />

                    {/* Stats & Price */}
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex gap-3 text-gray-400">
                            <span className="flex items-center gap-1">
                                <Icon icon="mdi:book-open-page-variant" />
                                {course.total_chapters || 0} Ch.
                            </span>
                            {course.total_duration && (
                                <span className="flex items-center gap-1">
                                    <Icon icon="mdi:clock-outline" />
                                    {course.total_duration}
                                </span>
                            )}
                        </div>

                        <div className="font-bold">
                            {isFree ? (
                                <span className="text-nexus-green">FREE</span>
                            ) : (
                                <span className="text-white">
                                    From RM {lowestPrice}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

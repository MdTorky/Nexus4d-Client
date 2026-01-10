import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
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

    if (loading) return <Loader text="Loading Courses..." />;

    return (
        <div>
            {/* Search Bar */}
            <div className="mb-6 relative">
                <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                    type="text"
                    placeholder="Search courses by title or status..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-nexus-card border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-nexus-green transition-colors"
                />
            </div>

            {filteredCourses.length === 0 ? (
                <div className="text-center py-16 bg-nexus-card/30 rounded-xl border border-dashed border-gray-700">
                    <p className="text-gray-500">No courses found matching "{searchQuery}".</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <div key={course._id} className="group relative bg-nexus-card rounded-xl overflow-hidden border border-white/5">
                            <div className="aspect-video w-full overflow-hidden bg-gray-800">
                                <img
                                    src={course.thumbnail_url || '/placeholder_course.jpg'}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg line-clamp-1">{course.title}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded ${course.status === 'complete' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        {course.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 border-t border-white/5 pt-3">
                                    <span>{course.enrolled_students} Students</span>
                                    <Link
                                        to={`/admin/courses/${course._id}/edit`}
                                        className="flex items-center gap-1 text-nexus-green hover:underline"
                                    >
                                        Manage <Icon icon="mdi:cog" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
// import Navbar from '../components/common/Navbar';
// import { useAuth } from '../context/AuthContext';

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
    // const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Use 'api' instance which has baseURL configured
                const response = await api.get('/courses/tutor/my-courses');
                setCourses(response.data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
                setCourses([]); // Fallback to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    return (
        <div className="min-h-screen bg-nexus-black font-sans text-nexus-white">
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Tutor Dashboard
                        </h1>
                        <p className="text-gray-400 mt-2">Overview of your assigned courses</p>
                    </div>
                    {/* Create Button Removed - Admin Only */}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-nexus-card p-6 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                                <Icon icon="mdi:book-open-page-variant" className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Assigned Courses</p>
                                <p className="text-2xl font-bold">{courses.length}</p>
                            </div>
                        </div>
                    </div>
                    {/* Add more analytics here later */}
                </div>

                {/* Courses List */}
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Icon icon="mdi:bookshelf" className="text-nexus-green" />
                    My Assigned Courses
                </h2>

                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading courses...</div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 bg-nexus-card/30 rounded-xl border border-dashed border-gray-700">
                        <Icon icon="mdi:notebook-outline" className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-300">No courses assigned</h3>
                        <p className="text-gray-500 mb-6">Contact an admin to get assigned to a course.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course._id} className="group relative bg-nexus-card rounded-xl overflow-hidden border border-white/5">
                                <div className="aspect-video w-full overflow-hidden bg-gray-800">
                                    <img
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg line-clamp-1">{course.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded ${course.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {course.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{course.description}</p>
                                    <div className="flex justify-between items-center text-sm text-gray-500 border-t border-white/5 pt-3">
                                        <span>{course.enrolled_students} Students</span>
                                        {/* View Details Only - No Edit */}
                                        <Link
                                            to={`/tutor/courses/${course._id}/edit`}
                                            className="flex items-center gap-1 text-gray-400 hover:text-white"
                                        >
                                            View Details <Icon icon="mdi:eye" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

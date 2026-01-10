// ... imports
// import { useState, useEffect } from 'react';
import EnrollmentAnalytics from '../components/admin/EnrollmentAnalytics';
import { useAuth } from '../context/AuthContext';
import ApplicationsList from '../components/admin/ApplicationsList';
import ApplicationsAnalytics from '../components/admin/ApplicationsAnalytics';
import CourseManagerAnalytics from '../components/admin/CourseManagerAnalytics';
import PendingEnrollmentsList from '../components/admin/PendingEnrollmentsList';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import CourseList from '../components/admin/CourseList';
import AccountsList from '../components/admin/AccountsList';
import AccountsAnalytics from '../components/admin/AccountsAnalytics';
import NexonManager from '../components/admin/NexonManager';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    // Derived state from URL or defaults
    const activeTab = searchParams.get('tab') || 'applications';
    const subTab = searchParams.get('view') || 'requests'; // shared sub-tab key

    // Helper to change tab
    const handleTabChange = (tab: string) => {
        setSearchParams({ tab, view: 'requests' }); // Reset sub-tab on main tab change
    };

    // Helper to change sub-tab
    const handleSubTabChange = (view: string) => {
        setSearchParams({ tab: activeTab, view });
    };

    if (!user || user.role !== 'admin') {
        // ... (forbidden code remains same)
        return (
            <div className="flex h-screen items-center justify-center bg-nexus-black text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">403 Forbidden</h1>
                    <p>Access Restricted to Admins Only.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-nexus-black px-4 py-8 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-nexus-white">Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleTabChange('accounts')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'accounts' ? 'bg-nexus-green text-black' : 'text-gray-400 hover:text-white hover:scale-105 transition duration-300'}`}
                        >
                            Accounts
                        </button>
                        <button
                            onClick={() => handleTabChange('applications')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'applications' ? 'bg-nexus-green text-black' : 'text-gray-400 hover:text-white hover:scale-105 transition duration-300'}`}
                        >
                            Tutor Applications
                        </button>
                        <button
                            onClick={() => handleTabChange('courses')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'courses' ? 'bg-nexus-green text-black' : 'text-gray-400 hover:text-white hover:scale-105 transition duration-300'}`}
                        >
                            Course Manager
                        </button>
                        <button
                            onClick={() => handleTabChange('enrollments')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'enrollments' ? 'bg-nexus-green text-black' : 'text-gray-400 hover:text-white hover:scale-105 transition duration-300'}`}
                        >
                            Enrollments
                        </button>
                        <button
                            onClick={() => handleTabChange('nexons')}
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'nexons' ? 'bg-nexus-green text-black' : 'text-gray-400 hover:text-white hover:scale-105 transition duration-300'}`}
                        >
                            Nexons
                        </button>

                    </div>
                </div>

                {activeTab === 'applications' && (
                    <div>
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                            <button
                                onClick={() => handleSubTabChange('requests')}
                                className={`text-sm font-medium pb-1 transition-colors ${subTab === 'requests' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                            >
                                Requests
                            </button>
                            <button
                                onClick={() => handleSubTabChange('overview')}
                                className={`text-sm font-medium pb-1 transition-colors ${subTab === 'overview' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                            >
                                Overview & Analytics
                            </button>
                        </div>

                        {subTab === 'requests' ? <ApplicationsList /> : <ApplicationsAnalytics />}
                    </div>
                )}

                {activeTab === 'enrollments' && (
                    <div>
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                            <button
                                onClick={() => handleSubTabChange('requests')}
                                className={`text-sm font-medium pb-1 transition-colors ${subTab === 'requests' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                            >
                                Requests
                            </button>
                            <button
                                onClick={() => handleSubTabChange('overview')}
                                className={`text-sm font-medium pb-1 transition-colors ${subTab === 'overview' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                            >
                                Overview & Analytics
                            </button>
                        </div>

                        {subTab === 'requests' ? <PendingEnrollmentsList /> : <EnrollmentAnalytics />}
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleSubTabChange('requests')} // Reuse 'requests' as 'manage' or make specific
                                    className={`text-sm font-medium pb-1 transition-colors ${subTab === 'requests' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Manage Courses
                                </button>
                                <button
                                    onClick={() => handleSubTabChange('overview')}
                                    className={`text-sm font-medium pb-1 transition-colors ${subTab === 'overview' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                                >
                                    Overview & Analytics
                                </button>
                            </div>

                            {subTab === 'requests' && (
                                <Link
                                    to="/admin/courses/create"
                                    className="flex items-center gap-2 bg-nexus-green text-black px-4 py-2 rounded-lg font-bold hover:bg-nexus-green/90 transition-colors"
                                >
                                    <Icon icon="mdi:plus" /> Create Course
                                </Link>
                            )}
                        </div>

                        {subTab === 'requests' ? <CourseList /> : <CourseManagerAnalytics />}
                    </div>
                )}

                {activeTab === 'accounts' && (
                    <div>
                        <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                            <button
                                onClick={() => handleSubTabChange('requests')}
                                className={`text-sm font-medium pb-1 transition-colors ${subTab === 'requests' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                            >
                                User List
                            </button>
                            <button
                                onClick={() => handleSubTabChange('overview')}
                                className={`text-sm font-medium pb-1 transition-colors ${subTab === 'overview' ? 'text-nexus-green border-b-2 border-nexus-green' : 'text-gray-400 hover:text-white'}`}
                            >
                                Analytics
                            </button>
                        </div>

                        {subTab === 'requests' ? <AccountsList /> : <AccountsAnalytics />}
                    </div>
                )}

                {activeTab === 'nexons' && <NexonManager />}
            </div>
        </div>
    );
}

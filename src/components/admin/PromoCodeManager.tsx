import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axios';
import type { PromoCode } from '../../types';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader } from '../ui/Loader';

export default function PromoCodeManager() {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [courses, setCourses] = useState<{ _id: string, title: string }[]>([]);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        applicablePackages: [] as string[],
        applicableCourses: [] as string[]
    });

    useEffect(() => {
        fetchCodes();
        fetchCourses();
    }, []);

    const fetchCodes = async () => {
        try {
            const { data } = await api.get('/promocodes');
            setCodes(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const { data } = await api.get('/courses');
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/promocodes', {
                ...formData,
                discountValue: Number(formData.discountValue),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined
            });
            setShowCreateModal(false);
            fetchCodes();
        } catch (error) {
            alert('Failed to create code');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await api.post(`/promocodes/${id}/toggle`);
            setCodes(codes.map(code => code._id === id ? { ...code, isActive: !code.isActive } : code));
        } catch (error) {
            console.error(error);
        }
    };

    const handlePackageToggle = (pkg: string) => {
        setFormData(prev => {
            if (prev.applicablePackages.includes(pkg)) {
                return { ...prev, applicablePackages: prev.applicablePackages.filter(p => p !== pkg) };
            } else {
                return { ...prev, applicablePackages: [...prev.applicablePackages, pkg] };
            }
        });
    };

    const handleCourseToggle = (courseId: string) => {
        setFormData(prev => {
            if (prev.applicableCourses.includes(courseId)) {
                return { ...prev, applicableCourses: prev.applicableCourses.filter(id => id !== courseId) };
            } else {
                return { ...prev, applicableCourses: [...prev.applicableCourses, courseId] };
            }
        });
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader text="Loading Promocodes" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Promo Codes</h2>
                    <p className="text-gray-400 text-sm">Manage discounts and promotional campaigns.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-nexus-green text-black px-5 py-2.5 rounded-xl font-bold hover:bg-green-400 shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
                >
                    <Icon icon="mdi:plus-circle" className="text-xl" /> Create New Code
                </button>
            </div>

            <div className="bg-nexus-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50">
                <div className="overflow-x-auto">
                    {codes.length === 0 ? (
                        <div className="text-center py-20 bg-nexus-card/30 rounded-2xl border border-white/5 border-dashed m-4">
                            <Icon icon="mdi:ticket-percent-outline" className="mx-auto text-6xl text-gray-600 mb-4" />
                            <p className="text-gray-500">No active promo codes found.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="p-5">Code</th>
                                    <th className="p-5">Discount</th>
                                    <th className="p-5">Restriction</th>
                                    <th className="p-5">Usage</th>
                                    <th className="p-5">Validity</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence>
                                    {codes.map((code, index) => (
                                        <motion.tr
                                            key={code._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="p-5">
                                                <div className="font-mono text-nexus-green font-bold text-lg tracking-wider">{code.code}</div>
                                                <div className="text-xs text-gray-500">
                                                    ID: <span className="font-mono">{code._id.slice(-6)}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="font-bold text-white text-lg">
                                                    {code.discountType === 'percentage' ? `${code.discountValue}%` : `$${code.discountValue}`}
                                                </div>
                                                <div className="text-xs text-gray-500 capitalize">{code.discountType} off</div>
                                            </td>
                                            <td className="p-5 text-sm text-gray-300 max-w-xs">
                                                {code.applicableCourses?.length ? (
                                                    <div className="flex items-center gap-1.5" title={`${code.applicableCourses.length} Courses`}>
                                                        <Icon icon="mdi:book-open-page-variant" className="text-nexus-green" />
                                                        <span>{code.applicableCourses.length} Courses</span>
                                                    </div>
                                                ) : code.applicablePackages?.length ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {code.applicablePackages.map(pkg => (
                                                            <span key={pkg} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs capitalize">
                                                                {pkg}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 italic">No Restrictions</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold ${code.usageLimit && code.usedCount >= code.usageLimit ? 'text-red-400' : 'text-white'}`}>
                                                        {code.usedCount}
                                                    </span>
                                                    <span className="text-gray-600">/</span>
                                                    <span className="text-gray-400">{code.usageLimit || '∞'}</span>
                                                </div>
                                                {code.usageLimit && (
                                                    <div className="w-20 h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${code.usedCount >= code.usageLimit ? 'bg-red-500' : 'bg-nexus-green'}`}
                                                            style={{ width: `${Math.min((code.usedCount / code.usageLimit) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-5 text-sm text-gray-400">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Icon icon="mdi:calendar-start" className="text-gray-600" />
                                                    {new Date(code.validFrom).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Icon icon="mdi:calendar-end" className={`${new Date(code.validUntil) < new Date() ? 'text-red-400' : 'text-gray-600'}`} />
                                                    <span className={`${new Date(code.validUntil) < new Date() ? 'text-red-400' : ''}`}>
                                                        {new Date(code.validUntil).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${code.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    }`}>
                                                    {code.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => handleToggle(code._id)}
                                                    className={`p-2 rounded-lg transition-all ${code.isActive
                                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white'
                                                        : 'bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-black'
                                                        }`}
                                                    title={code.isActive ? "Deactivate Code" : "Activate Code"}
                                                >
                                                    <Icon icon={code.isActive ? "mdi:power" : "mdi:power-on"} width="20" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {createPortal(
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                                onClick={() => setShowCreateModal(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="bg-[#09090b] border border-white/10 rounded-2xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar relative z-10 shadow-2xl shadow-nexus-green/10"
                            >
                                {/* ... modal content ... */}
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Create Promo Code</h3>
                                    <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <Icon icon="mdi:close" className="text-xl" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-5">
                                    {/* ... form content ... */}
                                    <div>
                                        <label className="block text-xs uppercase font-bold text-nexus-green tracking-wider mb-1.5">Discount Code</label>
                                        <div className="relative">
                                            <Icon icon="mdi:ticket-confirmation" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-nexus-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white font-mono text-lg focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none uppercase placeholder-gray-700 transition-all"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                placeholder="SUMMER2026"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-nexus-green tracking-wider mb-1.5">Type</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-nexus-black border border-white/10 rounded-lg pl-3 pr-10 py-3 text-white outline-none appearance-none focus:border-nexus-green transition-all"
                                                    value={formData.discountType}
                                                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                                >
                                                    <option value="percentage">Percentage (%)</option>
                                                    <option value="fixed">Fixed Amount ($)</option>
                                                </select>
                                                <Icon icon="mdi:chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-nexus-green tracking-wider mb-1.5">Value</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white focus:border-nexus-green outline-none transition-all font-bold"
                                                value={formData.discountValue}
                                                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1.5">Valid From</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-white/30 transition-all"
                                                value={formData.validFrom}
                                                onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1.5">Valid Until</label>
                                            <input
                                                required
                                                type="date"
                                                className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-white/30 transition-all"
                                                value={formData.validUntil}
                                                onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1.5">Usage Limit (Optional)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-nexus-black border border-white/10 rounded-lg p-3 text-white outline-none focus:border-white/30 transition-all"
                                            value={formData.usageLimit}
                                            onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                            placeholder="Enter max usages (leave blank for unlimited)"
                                        />
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-3">Applicable Packages</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['basic', 'advanced', 'premium'].map(pkg => (
                                                <label key={pkg} className="group flex items-center gap-3 cursor-pointer">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.applicablePackages.includes(pkg)}
                                                            onChange={() => handlePackageToggle(pkg)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="w-5 h-5 border-2 border-gray-600 rounded bg-transparent peer-checked:bg-nexus-green peer-checked:border-nexus-green transition-all" />
                                                        <Icon icon="mdi:check" className="absolute inset-0 text-black opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                    <span className="capitalize text-sm text-gray-300 group-hover:text-white transition-colors">{pkg}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">Leave unchecked for all packages</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase font-bold text-gray-400 tracking-wider mb-1.5">Applicable Courses</label>
                                        <div className="max-h-40 overflow-y-auto bg-nexus-black border border-white/10 rounded-xl p-2 space-y-1 custom-scrollbar">
                                            {courses.length > 0 ? courses.map(course => (
                                                <label key={course._id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.applicableCourses.includes(course._id)}
                                                            onChange={() => handleCourseToggle(course._id)}
                                                            className="peer sr-only"
                                                        />
                                                        <div className="w-4 h-4 border border-gray-600 rounded bg-transparent peer-checked:bg-nexus-green peer-checked:border-nexus-green transition-all" />
                                                        <Icon icon="mdi:check" className="absolute inset-0 text-black text-xs opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                    <span className="text-sm text-gray-300 group-hover:text-white truncate">{course.title}</span>
                                                </label>
                                            )) : (
                                                <p className="text-xs text-gray-500 p-2 text-center">No active courses found.</p>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-wide">Select specific courses only. Leave unchecked for all.</p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-5 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-bold text-sm transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-nexus-green text-black rounded-lg font-bold text-sm hover:bg-green-400 shadow-lg shadow-green-900/20 transition-all hover:scale-105 active:scale-95"
                                        >
                                            Create Promo Code
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}

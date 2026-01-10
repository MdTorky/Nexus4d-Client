import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';

interface TopCourse {
    major: string;
    description: string;
    _id: string;
    title: string;
    tutor_name?: string;
    thumbnail_url?: string;
    category?: string;
    enrolled_students?: number;
}

export default function Home() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [topCourses, setTopCourses] = useState<TopCourse[]>([]);

    useEffect(() => {
        // Fetch a few courses for the showcase (mock or real)
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                // Slice top 3 for display
                setTopCourses(data.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch courses for home", error);
            }
        };
        fetchCourses();
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-nexus-black text-nexus-white overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden pt-20">
                {/* Dynamic Background Elements */}
                <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-nexus-green/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

                {/* Hero Grid Pattern */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />

                <motion.div
                    className="relative z-10 max-w-5xl text-center space-y-8"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-nexus-green text-sm font-medium backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexus-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-nexus-green"></span>
                        </span>
                        {t('home.heroBadge', 'The Future of Learning is Here')}
                    </motion.div>

                    <motion.h1
                        variants={fadeInUp}
                        className="text-6xl md:text-8xl font-black  text-white leading-[0.9]"
                    >
                        Level Up Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green to-teal-400">Knowledge</span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('home.heroSubtitle')}
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/courses"
                            className="w-full sm:w-auto px-8 py-4 bg-nexus-green text-black font-bold text-lg rounded-full hover:bg-nexus-green/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2"
                        >
                            <Icon icon="mdi:rocket-launch" className="text-xl" />
                            {t('home.exploreCourses')}
                        </Link>
                        {!user && (
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-bold text-lg rounded-full hover:bg-white/10 border border-white/10 hover:border-nexus-green/50 transition-all flex items-center justify-center gap-2"
                            >
                                <Icon icon="mdi:account-plus" className="text-xl" />
                                {t('nav.joinNow')}
                            </Link>
                        )}
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-500"
                >
                    <Icon icon="mdi:chevron-down" className="text-3xl" />
                </motion.div>
            </section>

            {/* --- STATS SECTION --- */}
            {/* <section className="py-12 border-y border-white/5 bg-black/40 backdrop-blur-sm relative z-20">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
                        {[
                            { count: "10k+", label: t('home.stats.students'), icon: "mdi:account-group" },
                            { count: "50+", label: t('home.stats.courses'), icon: "mdi:book-open-page-variant" },
                            { count: "20+", label: t('home.stats.tutors'), icon: "mdi:teach" },
                            { count: "99%", label: "Satisfaction", icon: "mdi:heart" }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4"
                            >
                                <Icon icon={stat.icon} className="text-3xl text-gray-600 mx-auto mb-2" />
                                <h3 className="text-3xl md:text-4xl font-black text-white">{stat.count}</h3>
                                <p className="text-nexus-green uppercase tracking-wider text-xs font-bold mt-1">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* --- GAMIFICATION FEATURE --- */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute right-0 top-1/4 w-[600px] h-[600px] bg-nexus-green/5 rounded-full blur-[150px]" />

                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={staggerContainer}
                            >
                                <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
                                    Learn to Earn. <br />
                                    <span className="text-nexus-green">Collect Them All.</span>
                                </motion.h2>
                                <motion.p variants={fadeInUp} className="text-gray-400 text-lg leading-relaxed mb-8">
                                    Transform your education into a game. Earn XP for every lesson, unlock exclusive Nexons (Avatars), and level up your profile to show off your achievements.
                                </motion.p>

                                <motion.ul variants={fadeInUp} className="space-y-4">
                                    {[
                                        "Earn XP for watching videos & completing lessons",
                                        "Unlock rare, animated Avatars",
                                        "Climb the global leaderboard",
                                        "Showcase your profile to employers"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300">
                                            <Icon icon="mdi:check-circle" className="text-nexus-green flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </motion.ul>
                            </motion.div>
                        </div>

                        <motion.div
                            className="lg:w-1/2 relative"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            {/* Visual Representation of Cards/Avatars */}
                            <div className="relative z-10 grid grid-cols-2 gap-4">
                                <div className="space-y-4 mt-8">
                                    <div className="bg-[#121212] p-4 rounded-2xl border border-white/10 hover:border-nexus-green/50 transition-colors">
                                        <img src="/Icons/M Sleepy Nexon.png" alt="Avatar" className="w-full aspect-square object-contain bg-black rounded-xl mb-3" />
                                        <div className="h-2 w-20 bg-nexus-green rounded mb-1"></div>
                                        <div className="h-2 w-12 bg-white/20 rounded"></div>
                                    </div>
                                    <div className="bg-[#121212] p-4 rounded-2xl border border-white/10 opacity-50">
                                        <div className="w-full aspect-square bg-white/5 rounded-xl mb-3 flex items-center justify-center">
                                            <Icon icon="mdi:lock" className="text-4xl text-white/20" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-[#121212] p-4 rounded-2xl border border-white/10 opacity-50">
                                        <div className="w-full aspect-square bg-white/5 rounded-xl mb-3 flex items-center justify-center">
                                            <Icon icon="mdi:lock" className="text-4xl text-white/20" />
                                        </div>
                                    </div>
                                    <div className="bg-[#121212] p-4 rounded-2xl border border-nexus-green shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                        <img src="/Icons/F Electrical Engineer Nexon.png" alt="Avatar" className="w-full aspect-square object-contain bg-black rounded-xl mb-3" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-nexus-green">UNLOCKED</span>
                                            <Icon icon="mdi:star" className="text-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- COURSES CAROUSEL --- */}
            <section className="py-24 bg-white/[0.02]">
                <div className="container mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Popular Courses</h2>
                            <p className="text-gray-400">Explore our highest-rated content</p>
                        </div>
                        <Link to="/courses" className="text-nexus-green font-bold hover:underline hidden md:block">
                            View All Courses →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {topCourses.length > 0 ? (
                            topCourses.map((course, i) => (
                                <Link to={`/courses/${course._id}`} key={course._id} className="group">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-nexus-green/50 hover:y-[-5px] transition-all duration-300 h-full flex flex-col"
                                    >
                                        <div className="aspect-video bg-gray-800 relative overflow-hidden">
                                            <img
                                                src={course.thumbnail_url || '/placeholder-course.jpg'}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="bg-nexus-green text-black rounded-full p-3">
                                                    <Icon icon="mdi:play" className="text-2xl" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="text-xs font-bold text-nexus-green mb-2 uppercase tracking-wider">{course.major}</div>
                                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                                            <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
                                            {/* <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-4 mt-auto">
                                                <span className="flex items-center gap-1">
                                                    <Icon icon="mdi:account-group" /> {course.level || 0} Students
                                                </span>
                                            </div> */}
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        ) : (
                            // Fallback Skeletons
                            [1, 2, 3].map((n) => (
                                <div key={n} className="bg-white/5 rounded-2xl h-[300px] animate-pulse" />
                            ))
                        )}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/courses" className="text-nexus-green font-bold hover:underline">
                            View All Courses →
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-24 px-6">
                <div className="container mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t('home.features.title')}</h2>
                        <p className="text-gray-400">Everything you need to succeed in your academic journey.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "mdi:certificate-outline",
                                title: t('home.features.quality.title'),
                                desc: t('home.features.quality.desc'),
                                color: "text-blue-400",
                                bg: "bg-blue-400/10"
                            },
                            {
                                icon: "mdi:clock-time-four-outline",
                                title: t('home.features.flexibility.title'),
                                desc: t('home.features.flexibility.desc'),
                                color: "text-purple-400",
                                bg: "bg-purple-400/10"
                            },
                            {
                                icon: "mdi:earth",
                                title: t('home.features.community.title'),
                                desc: t('home.features.community.desc'),
                                color: "text-orange-400",
                                bg: "bg-orange-400/10"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:bg-white/[0.03] transition-colors"
                            >
                                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon icon={feature.icon} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TUTOR CTA --- */}
            <section className="py-24 px-6 bg-gradient-to-r from-green-900/20 to-black border-y border-white/5">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Share Your Knowledge</h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Are you an expert in your field? Become a tutor on Nexus 4D, create content, and earn revenue while helping students succeed.
                        </p>
                        <Link
                            to="/tutor-application"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-nexus-green text-nexus-green hover:bg-nexus-green hover:text-black font-bold transition-all"
                        >
                            <Icon icon="mdi:teach" />
                            Apply as Tutor
                        </Link>
                    </div>
                    <div className="md:w-1/3 flex justify-center text-[150px] text-nexus-green/20">
                        <Icon icon="mdi:school" />
                    </div>
                </div>
            </section>

            {/* --- FINAL CTA --- */}
            <section className="py-32 px-6 text-center">
                <div className="container mx-auto max-w-4xl relative">
                    <div className="absolute inset-0 bg-nexus-green/20 blur-[100px] -z-10 rounded-full" />

                    <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-gray-400 mb-12">
                        Join thousands of students learning in a new, engaging way.
                    </p>
                    <Link
                        to="/register"
                        className="inline-block rounded-full bg-white px-12 py-5 text-xl font-bold text-nexus-black transition-transform hover:scale-105 shadow-xl hover:shadow-white/20"
                    >
                        {t('home.cta.button')}
                    </Link>
                </div>
            </section>

            {/* --- FOOTER (Mini) --- */}
            <footer className="py-8 border-t border-white/5 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Nexus 4D. All rights reserved.</p>
            </footer>

        </div>
    );
}

import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import i18n from '../i18n';

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
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setTopCourses(data.slice(0, 3));
            } catch (error) {
                console.error("Failed to fetch courses for home", error);
            }
        };
        fetchCourses();
    }, []);

    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-nexus-green selection:text-black">

            {/* --- HERO SECTION --- */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
                {/* Immersive Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black opacity-60" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />

                {/* Animated Orbs */}
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-nexus-green/10 rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"
                />

                <motion.div
                    className="relative z-10 max-w-6xl text-center space-y-10"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexus-green opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-nexus-green"></span>
                        </span>
                        <span className="text-nexus-green text-xs font-bold tracking-widest uppercase">{t('home.heroBadge', 'NEXUS ONLINE v4.0')}</span>
                    </motion.div>

                    {/* Headline */}
                    {i18n.language === "en" ? (<motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mix-blend-screen">
                        {t('home.heroTitle', 'LEVEL UP YOUR KNOWLEDGE').split(' ').slice(0, 3).join(' ')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green via-emerald-400 to-cyan-500 animate-pulse">
                            {t('home.heroTitle').split(' ').slice(3).join(' ')}
                        </span>
                    </motion.h1>
                    ) : (
                        <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] mix-blend-screen">
                            {t('home.heroTitle', 'LEVEL UP YOUR KNOWLEDGE').split(' ').slice(0, 2).join(' ')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexus-green via-emerald-400 to-cyan-500 animate-pulse">
                                {t('home.heroTitle').split(' ').slice(2).join(' ')}
                            </span>
                        </motion.h1>
                    )}

                    {/* Subtitle */}
                    <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light">
                        {t('home.heroSubtitle', 'Nexus 4D is the premiere platform for gamified learning. Master new skills, unlock rare avatars, and define your future.')}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Link
                            to="/courses"
                            className="group relative px-10 py-5 bg-nexus-green text-black font-black text-lg tracking-wider uppercase rounded-full overflow-hidden shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] hover:scale-105 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12" />
                            <span className="relative flex items-center gap-3">
                                <Icon icon="mdi:rocket-launch" className="text-2xl" />
                                {t('home.exploreCourses', 'Start Mission')}
                            </span>
                        </Link>
                        {!user && (
                            <Link
                                to="/register"
                                className="group px-10 py-5 bg-transparent border border-white/20 text-white font-bold text-lg tracking-wider uppercase rounded-full hover:bg-white/5 hover:border-nexus-green/50 transition-all flex items-center gap-3 backdrop-blur-sm"
                            >
                                <Icon icon="mdi:account-plus" className="text-2xl group-hover:text-nexus-green transition-colors" />
                                {t('home.joinNexus', 'Join Nexus')}
                            </Link>
                        )}
                    </motion.div>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
                >
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t('home.scrollToBegin', 'Scroll to Begin')}</span>
                    <Icon icon="mdi:chevron-down" className="text-2xl animate-bounce text-nexus-green" />
                </motion.div>
            </section>

            {/* --- GAMIFICATION SHOWCASE (3D TILT) --- */}
            <section className="py-40 relative px-6 overflow-hidden">
                <div className="container mx-auto">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        {/* Text Content */}
                        <div className="lg:w-1/2 relative z-10">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={staggerContainer}
                                className="space-y-8"
                            >
                                <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 text-nexus-green font-bold tracking-widest uppercase text-sm">
                                    <Icon icon="mdi:trophy-outline" className="text-xl" />
                                    <span>{t('home.gamifiedLearning', 'Gamified Learning')}</span>
                                </motion.div>

                                <motion.h2 variants={fadeInUp} className="text-5xl md:text-7xl font-black leading-none">
                                    {t('home.earnCollectDominate', 'EARN. COLLECT. DOMINATE.').split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600">{t('home.earnCollectDominate', 'EARN. COLLECT. DOMINATE.').split(' ')[1]}</span> <br />
                                    {t('home.earnCollectDominate', 'EARN. COLLECT. DOMINATE.').split(' ').slice(2).join(' ')}
                                </motion.h2>

                                <motion.p variants={fadeInUp} className="text-xl text-gray-400 leading-relaxed max-w-xl">
                                    {t('home.turningStudyHours', 'Turning study hours into XP. Complete missions to unlock exclusive Nexons and unlock new more as you learn.')}
                                </motion.p>

                                <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-6 pt-4">
                                    {[
                                        { label: t('home.earnXp', 'Earn XP'), icon: "bx:hive" },
                                        { label: t('home.levelUp', 'Level Up'), icon: "icon-park-outline:level" },
                                        { label: t('home.rareAvatars', 'Rare Avatars'), icon: "mdi:robot-happy" },
                                        { label: t('home.showcase', 'Showcase'), icon: "mdi:podcast" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-nexus-green/30 transition-colors">
                                            <Icon icon={item.icon} className="text-2xl text-nexus-green" />
                                            <span className="font-bold text-gray-200">{item.label}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* 3D Visuals */}
                        <motion.div
                            style={{ y }}
                            className="lg:w-1/2 relative perspective-1000"
                        >
                            <div className="relative z-10 transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out preserve-3d">
                                {/* Back Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-nexus-green/20 to-purple-500/20 blur-[60px] -z-10" />

                                {/* Main Card */}
                                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="px-3 py-1 bg-gradient-to-r from-nexus-green to-emerald-600 text-black text-xs font-black uppercase rounded-md shadow-[0_0_15px_#22c55e]">
                                            {t('home.legendaryDrop', 'Legendary Drop')}
                                        </span>
                                        <Icon icon="mdi:dots-horizontal" className="text-gray-500" />
                                    </div>
                                    <img
                                        src="/Icons/M Sleepy Nexon.png"
                                        alt="Avatar"
                                        className="w-full aspect-square object-contain animate-float drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                                    />
                                    <div className="mt-6 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-2/3" />
                                        <div className="h-4 bg-white/5 rounded w-1/2" />
                                    </div>
                                </div>

                                {/* Floating Elements */}
                                <div className="absolute -top-10 -right-10 bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 shadow-xl animate-float" style={{ animationDelay: "1s" }}>
                                    <Icon icon="mdi:gift" className="text-4xl text-purple-400" />
                                </div>
                                <div className="absolute -bottom-10 -left-10 bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 shadow-xl animate-float" style={{ animationDelay: "2s" }}>
                                    <div className="text-nexus-green font-black text-xl">{t('home.xpGained', '+2500 XP')}</div>
                                </div>
                            </div>

                            {/* Secondary Small Avatar Card (Floating) */}
                            <div
                                className="absolute -bottom-16 -right-4 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl md:w-60 w-40 animate-float z-50 "
                                style={{ animationDelay: "1.5s", transform: "translateZ(50px)" }}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">{t('home.unlocking', 'Unlocking...')}</span>
                                    <Icon icon="mdi:lock-open-variant" className="text-nexus-green text-xs" />
                                </div>
                                <img
                                    src="/Icons/F Computer Science Nexon.png"
                                    alt="Small Avatar"
                                    className="w-full aspect-square object-contain opacity-80"
                                />
                                <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-nexus-green w-3/4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- POPULAR COURSES --- */}
            <section className="py-24 bg-white/[0.02] relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black mb-4">{t('home.trendingMissions', 'Trending Missions')}</h2>
                            <p className="text-gray-400 text-lg">{t('home.joinMostActive', 'Join the most active learning paths.')}</p>
                        </div>
                        <Link to="/courses" className="px-6 py-3 rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all font-bold flex items-center gap-2">
                            {t('home.exploreDatabase', 'Explore Database')} <Icon icon="mdi:arrow-right" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {topCourses.length > 0 ? (
                            topCourses.map((course, i) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <Link to={`/courses/${course._id}`} className="group block h-full">
                                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden hover:border-nexus-green/50 transition-all duration-300 h-full flex flex-col relative hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                                            {/* Thumbnail */}
                                            <div className="aspect-[16/10] bg-gray-900 relative overflow-hidden">
                                                <img
                                                    src={course.thumbnail_url || '/placeholder-course.jpg'}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <div className="bg-nexus-green text-black rounded-full p-4 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                                        <Icon icon="mdi:play" className="text-3xl" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-xs font-bold text-nexus-green uppercase tracking-wider">
                                                    {course.major}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-nexus-green transition-colors line-clamp-2">{course.title}</h3>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">{course.description}</p>

                                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Icon icon="mdi:account-group" className="text-lg" />
                                                        <span>{course.enrolled_students || 0} Cadets</span>
                                                    </div>
                                                    <div className="text-nexus-green text-xs font-bold uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                        Access <Icon icon="mdi:arrow-right" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            // Skeletons
                            [1, 2, 3].map((n) => (
                                <div key={n} className="bg-white/5 rounded-3xl h-[400px] animate-pulse" />
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* --- HOLOGRAPHIC FEATURES --- */}
            <section className="py-32 px-6">
                <div className="container mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-black mb-6">{t('home.whyNexus', 'WHY NEXUS?')}</h2>
                        <div className="w-20 h-1 bg-nexus-green mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "mdi:infinity",
                                title: t('home.features.quality.title', 'Unlimited Access'),
                                desc: t('home.features.quality.desc', 'One subscription, infinite possibilities. Access the entire Nexus database.'),
                                color: "text-blue-400"
                            },
                            {
                                icon: "mdi:lightning-bolt",
                                title: t('home.features.flexibility.title', 'Instant Feedback'),
                                desc: t('home.features.flexibility.desc', 'AI-powered quizzes and real-time progress tracking to keep you sharp.'),
                                color: "text-yellow-400"
                            },
                            {
                                icon: "mdi:earth",
                                title: t('home.features.community.title', 'Global Network'),
                                desc: t('home.features.community.desc', 'Connect with thousands of other learners and tutors worldwide.'),
                                color: "text-purple-400"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-10 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 hover:border-nexus-green/30 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 p-32 bg-${feature.color.split('-')[1]}-500/5 blur-[80px] rounded-full pointer-events-none group-hover:opacity-100 transition-opacity opacity-50`} />

                                <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl mb-8 ${feature.color} group-hover:scale-110 group-hover:bg-white/10 transition-all`}>
                                    <Icon icon={feature.icon} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed font-light text-lg">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- DEDICATED TUTOR SECTION --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-nexus-green/10 to-black/80" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-white/5 border border-white/10 rounded-[3rem] p-12 backdrop-blur-sm">
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-flex items-center gap-2 text-nexus-green font-bold tracking-widest uppercase text-xs">
                                <Icon icon="mdi:teach" className="text-lg" />
                                <span>{t('home.joinFaculty', 'Join the Faculty')}</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                                {t('home.shareKnowledge', 'Share Knowledge. Earn Revenue.')}
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed">
                                {t('home.becomeVerified', 'Become a verified tutor on Nexus. Create courses, mentor students, and get paid for your expertise.')}
                            </p>
                            <Link
                                to="/tutor-application"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-nexus-green text-black font-bold rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                            >
                                <span>{t('home.applyNow', 'Apply Now')}</span>
                                <Icon icon="mdi:arrow-right" />
                            </Link>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-nexus-green/20 blur-[60px] rounded-full" />
                                <Icon icon="mdi:school-outline" className="text-[12rem] text-white/50 relative z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA BANNER --- */}
            <section className="py-24 px-6">
                <div className="container mx-auto">
                    <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-green-900 to-black border border-nexus-green/30 p-12 md:p-24 text-center">
                        {/* Animated Grid Background */}
                        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 animate-pulse-slow" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative z-10 max-w-4xl mx-auto space-y-8"
                        >
                            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight">
                                {t('home.readyToAscend', 'READY TO ASCEND?').split(' ').slice(0, 2).join(' ')} <br />
                                <span className="text-nexus-green drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]">{t('home.readyToAscend', 'READY TO ASCEND?').split(' ')[2]}</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-300 font-light">
                                {t('home.joinElite', 'Join the elite at Nexus 4D. Your journey to mastery begins now.')}
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                                <Link
                                    to="/register"
                                    className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-lg rounded-full hover:bg-nexus-green transition-colors shadow-2xl"
                                >
                                    {t('home.initializeAccount', 'Initialize Account')}
                                </Link>
                                <Link
                                    to="/tutor-application"
                                    className="px-12 py-5 bg-black/50 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-widest text-lg rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon icon="mdi:teach" /> {t('home.applyAsTutor', 'Apply as Tutor')}
                                    </span>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 border-t border-white/5 bg-black">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        <img src="/Logo Horizontal.png" className="h-6" alt="Nexus 4D" />
                        <span>&copy; {new Date().getFullYear()} {t('home.allRightsReserved', 'Nexus 4D. All rights reserved.')}</span>
                    </div>
                    <div className="flex gap-8">
                        <Link to="/privacy" className="hover:text-nexus-green transition-colors">{t('home.privacyProtocol', 'Privacy Protocol')}</Link>
                        <Link to="/terms" className="hover:text-nexus-green transition-colors">{t('home.termsOfService', 'Terms of Service')}</Link>
                        <Link to="/contact" className="hover:text-nexus-green transition-colors">{t('home.contactCommand', 'Contact Command')}</Link>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
            `}</style>
        </div>
    );
}

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { t } = useTranslation();
    const { user } = useAuth();


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-nexus-black text-nexus-white">
            {/* HERO SECTION */}
            <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center lg:py-48 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-nexus-green/10 blur-[120px]" />

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-4xl"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl"
                    >
                        {t('home.heroTitle').split('Nexus 4D').map((part, i, arr) => (
                            <span key={i}>
                                {part}
                                {i < arr.length - 1 && <span className="text-nexus-green">Nexus 4D</span>}
                            </span>
                        ))}
                        {/* Fallback if split doesn't work as expected for Arabic/Structure */}
                        {/* This simple split logic might need adjustment but serves the visual purpose for now */}
                    </motion.h1>

                    <motion.p variants={itemVariants} className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 lg:text-xl">
                        {t('home.heroSubtitle')}
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/courses"
                            className="rounded-full bg-nexus-green px-8 py-4 text-base font-bold text-nexus-black transition-transform hover:scale-105 hover:shadow-lg hover:shadow-nexus-green/25"
                        >
                            {t('home.exploreCourses')}
                        </Link>
                        {!user && (<Link
                            to="/register"
                            className="rounded-full border border-gray-700 bg-nexus-card px-8 py-4 text-base font-medium text-nexus-white transition-colors hover:border-nexus-green hover:text-nexus-green"
                        >
                            {t('home.startLearning')}
                        </Link>)}
                    </motion.div>
                </motion.div>
            </section>

            {/* STATS SECTION */}
            <section className="border-y border-nexus-card bg-nexus-card/30 py-12 backdrop-blur-sm">
                <div className="container mx-auto grid grid-cols-1 gap-8 px-6 md:grid-cols-3 text-center">
                    {[
                        { count: "10k+", label: t('home.stats.students') },
                        { count: "50+", label: t('home.stats.courses') },
                        { count: "20+", label: t('home.stats.tutors') }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <h3 className="text-4xl font-bold text-nexus-green">{stat.count}</h3>
                            <p className="mt-2 text-gray-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section className="py-24 px-6">
                <div className="container mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center text-3xl font-bold lg:text-4xl"
                    >
                        {t('home.features.title')}
                    </motion.h2>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                            {
                                icon: "mdi:certificate-outline",
                                title: t('home.features.quality.title'),
                                desc: t('home.features.quality.desc')
                            },
                            {
                                icon: "mdi:clock-time-four-outline",
                                title: t('home.features.flexibility.title'),
                                desc: t('home.features.flexibility.desc')
                            },
                            {
                                icon: "mdi:earth",
                                title: t('home.features.community.title'),
                                desc: t('home.features.community.desc')
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group rounded-2xl border border-nexus-card bg-nexus-card p-8 transition-all hover:border-nexus-green/50 hover:bg-nexus-card/80"
                            >
                                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-nexus-green/10 text-nexus-green group-hover:bg-nexus-green group-hover:text-nexus-black transition-colors">
                                    <Icon icon={feature.icon} width={32} />
                                </div>
                                <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                                <p className="text-gray-400">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-24 px-6">
                <div className="container mx-auto">
                    <div className="rounded-3xl bg-gradient-to-br from-nexus-card to-nexus-black border border-nexus-card p-12 text-center lg:p-20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-nexus-green/5 blur-[100px]" />

                        <h2 className="relative z-10 mb-6 text-3xl font-bold lg:text-5xl">
                            {t('home.cta.title')}
                        </h2>
                        <div className="relative z-10">
                            <Link
                                to="/register"
                                className="inline-block rounded-full bg-nexus-white px-10 py-4 text-lg font-bold text-nexus-black transition-transform hover:scale-105"
                            >
                                {t('home.cta.button')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

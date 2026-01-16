
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const Section = ({ title, icon, children, delay }: { title: string, icon: string, children: React.ReactNode, delay: number }) => (
    <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay, duration: 0.5 }}
        className="bg-white/5 border border-white/10 p-8 rounded-2xl mb-8 backdrop-blur-sm hover:border-nexus-green/30 transition-colors"
    >
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-nexus-green/10 rounded-xl flex items-center justify-center text-nexus-green border border-nexus-green/20">
                <Icon icon={icon} className="text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-gray-400 leading-relaxed font-light space-y-4">
            {children}
        </div>
    </motion.div>
);

import { useTranslation } from 'react-i18next';

export default function TermsOfService() {
    const { t, i18n } = useTranslation();
    return (
        <div className={`min-h-screen bg-black text-white relative overflow-hidden selection:bg-nexus-green selection:text-black ${i18n.language === 'ar' ? 'font-changa' : 'font-coortif'}`}>

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-nexus-green/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
                        <span className="w-2 h-2 rounded-full bg-nexus-green animate-pulse" />
                        <span className="text-xs font-mono text-nexus-green uppercase tracking-widest">{t('tutorApp.terms.header.version')}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6">{t('tutorApp.terms.header.title1')} <br /><span className="text-nexus-green">{t('tutorApp.terms.header.title2')}</span></h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('tutorApp.terms.header.subtitle')}
                    </p>
                </motion.div>

                <div className="space-y-4">
                    <Section title={t('tutorApp.terms.missionAcceptance.title')} icon="mdi:handshake" delay={0.1}>
                        <p>
                            {t('tutorApp.terms.missionAcceptance.p1')}
                        </p>
                        <p>
                            {t('tutorApp.terms.missionAcceptance.p2')}
                        </p>
                    </Section>

                    <Section title={t('tutorApp.terms.cadetAccounts.title')} icon="codicon:account" delay={0.2}>
                        <p>
                            <strong>{t('tutorApp.terms.cadetAccounts.security')}</strong> {t('tutorApp.terms.cadetAccounts.securityDesc')}
                        </p>
                        <p>
                            <strong>{t('tutorApp.terms.cadetAccounts.accuracy')}</strong> {t('tutorApp.terms.cadetAccounts.accuracyDesc')}
                        </p>
                    </Section>

                    <Section title={t('tutorApp.terms.codeOfConduct.title')} icon="mdi:gavel" delay={0.3}>
                        <p>
                            {t('tutorApp.terms.codeOfConduct.intro')}
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-nexus-green">
                            <li>{t('tutorApp.terms.codeOfConduct.list.1')}</li>
                            <li>{t('tutorApp.terms.codeOfConduct.list.2')}</li>
                            <li>{t('tutorApp.terms.codeOfConduct.list.3')}</li>
                            <li>{t('tutorApp.terms.codeOfConduct.list.4')}</li>
                        </ul>
                    </Section>

                    <Section title={t('tutorApp.terms.intellectualProperty.title')} icon="mdi:brain" delay={0.4}>
                        <p>
                            {t('tutorApp.terms.intellectualProperty.p1')}
                        </p>
                        <p>
                            {t('tutorApp.terms.intellectualProperty.p2')}
                        </p>
                    </Section>

                    <Section title={t('tutorApp.terms.paymentsRefunds.title')} icon="mdi:credit-card-check" delay={0.5}>
                        <p>
                            <strong>{t('tutorApp.terms.paymentsRefunds.transactions')}</strong> {t('tutorApp.terms.paymentsRefunds.transactionsDesc')}
                        </p>
                        <p>
                            <strong>{t('tutorApp.terms.paymentsRefunds.refundProtocol')}</strong> {t('tutorApp.terms.paymentsRefunds.refundProtocolDesc')}
                        </p>
                    </Section>

                    <Section title={t('tutorApp.terms.commission.title')} icon="mdi:finance" delay={0.6}>
                        <p>
                            {t('tutorApp.terms.commission.desc')}
                        </p>
                    </Section>

                    <Section title={t('tutorApp.terms.termination.title')} icon="mdi:alert-octagon" delay={0.7}>
                        <p>
                            {t('tutorApp.terms.termination.desc')}
                        </p>
                    </Section>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center pt-12 border-t border-white/10 mt-16"
                    >
                        <p className="text-gray-500 mb-6">{t('tutorApp.terms.footer.lastUpdated')}</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-nexus-green text-black font-bold rounded-xl hover:bg-green-400 transition-colors"
                        >
                            <Icon icon="mdi:check-bold" />
                            {t('tutorApp.terms.footer.acknowledge')}
                        </Link>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

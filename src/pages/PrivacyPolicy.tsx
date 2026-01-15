
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
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Icon icon={icon} className="text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
        <div className="text-gray-400 leading-relaxed font-light space-y-4">
            {children}
        </div>
    </motion.div>
);

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-nexus-green selection:text-black">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-purple-900/10 rounded-full blur-[120px]" />
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
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Data Secure v2.1</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6">PRIVACY <br /><span className="text-blue-500">PROTOCOL</span></h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Your data is your currency. Here is how we secure it within the Nexus database.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    <Section title="1. Data Collection" icon="mdi:database-arrow-down" delay={0.1}>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
                            <li><strong>Identity Data:</strong> Username, email address, and avatar selections.</li>
                            <li><strong>Progress Data:</strong> Course completion rates, XP earned, and achievements unlocked.</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, and device information used for security auditing.</li>
                        </ul>
                    </Section>

                    <Section title="2. Usage of Intel" icon="mdi:chart-box" delay={0.2}>
                        <p>
                            Your data fuels the gamification engine. We use it to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
                            <li>Calculate global leaderboard rankings.</li>
                            <li>Personalize course recommendations based on your skill tree.</li>
                            <li>Process secure payments for premium content access.</li>
                            <li>Send critical mission updates (system notifications).</li>
                        </ul>
                    </Section>

                    <Section title="3. Data Sharing" icon="mdi:share-variant" delay={0.3}>
                        <p>
                            We do not sell your personal data. We only share information with third parties in the following scenarios:
                        </p>
                        <p>
                            <strong>Service Providers:</strong> Cloud hosting (AWS), payment processing, and email delivery services that help us run the platform.
                        </p>
                        <p>
                            <strong>Legal Compliance:</strong> If required by law or to protect the rights and safety of Nexus 4D and our users.
                        </p>
                    </Section>

                    <Section title="4. Cookie Protocol" icon="mdi:cookie" delay={0.4}>
                        <p>
                            We use cookies and similar tracking technologies to track the activity on our Service and store certain information.
                        </p>
                        <p>
                            These allow you to stay logged in ("Session State") and remember your preferences (e.g., Language or Volume settings). You can instruct your browser to refuse all cookies, but some parts of our Service may not function.
                        </p>
                    </Section>

                    <Section title="5. Security Measures" icon="mdi:shield-lock" delay={0.5}>
                        <p>
                            We employ industry-standard encryption (AES-256) and hashing algorithms (Bcrypt) to protect your passwords and sensitive data.
                        </p>
                        <p>
                            While we strive to use commercially acceptable means to protect your Personal Data, remember that no method of transmission over the Internet is 100% secure.
                        </p>
                    </Section>

                    <Section title="6. Your Rights" icon="mdi:account-key" delay={0.6}>
                        <p>
                            You have the right to access, update, or delete the information we have on you. You can do this directly within your "Profile Settings" section.
                        </p>
                        <p>
                            If you wish to be completely erased from the Nexus database ("Right to be Forgotten"), please contact support.
                        </p>
                    </Section>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center pt-12 border-t border-white/10 mt-16"
                    >
                        <p className="text-gray-500 mb-6">Effective Date: January 2026</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            <Icon icon="mdi:shield-check" />
                            Confirm & Continue
                        </Link>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

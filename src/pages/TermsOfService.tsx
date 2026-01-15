
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

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-nexus-green selection:text-black">

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
                        <span className="text-xs font-mono text-nexus-green uppercase tracking-widest">Protocol v4.0.1</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6">TERMS OF <br /><span className="text-nexus-green">SERVICE</span></h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Please review the terms of engagement before proceeding with your mission on Nexus 4D.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    <Section title="1. Mission Acceptance" icon="mdi:handshake" delay={0.1}>
                        <p>
                            By accessing or using the Nexus 4D platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you are not authorized to access the platform.
                        </p>
                        <p>
                            These protocols govern your use of our website, mobile interface, and all educational content provided herein.
                        </p>
                    </Section>

                    <Section title="2. Cadet Accounts" icon="mdi:account-shield" delay={0.2}>
                        <p>
                            <strong>Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account involves your liability.
                        </p>
                        <p>
                            <strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during the registration process. Using false identities or impersonating other cadets is strictly prohibited.
                        </p>
                    </Section>

                    <Section title="3. Code of Conduct" icon="mdi:gavel" delay={0.3}>
                        <p>
                            While operating within Nexus 4D, you agree NOT to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 marker:text-nexus-green">
                            <li>Exploit bugs or glitches to artificially inflate XP or Leaderboard standing.</li>
                            <li>Distribute, copy, or resell proprietary course materials outside the platform.</li>
                            <li>Harass, bully, or disrupt the learning experience of other cadets.</li>
                            <li>Use automated scripts or "bots" to interact with the service.</li>
                        </ul>
                    </Section>

                    <Section title="4. Intellectual Property" icon="mdi:brain" delay={0.4}>
                        <p>
                            All content available on Nexus 4D, including but not limited to text, graphics, logos, code, and course videos, is the property of Nexus 4D or its licensors and is protected by copyright laws.
                        </p>
                        <p>
                            You are granted a limited, non-exclusive, non-transferable license to access course materials for personal, non-commercial learning only.
                        </p>
                    </Section>

                    <Section title="5. Payments & Refunds" icon="mdi:credit-card-check" delay={0.5}>
                        <p>
                            <strong>Transactions:</strong> Premium courses and content packs are purchased via one-time payments. Prices are subject to change without notice.
                        </p>
                        <p>
                            <strong>Refund Protocol:</strong> Refunds may be requested within 7 days of purchase, provided that less than 20% of the course content has been consumed. Nexus 4D reserves the right to deny refunds for suspected abuse of this policy.
                        </p>
                    </Section>

                    <Section title="6. Termination" icon="mdi:alert-octagon" delay={0.6}>
                        <p>
                            Nexus 4D reserves the right to suspend or terminate your account ("Dishonorable Discharge") at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
                        </p>
                    </Section>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center pt-12 border-t border-white/10 mt-16"
                    >
                        <p className="text-gray-500 mb-6">Last Updated: January 2026</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-nexus-green text-black font-bold rounded-xl hover:bg-green-400 transition-colors"
                        >
                            <Icon icon="mdi:check-bold" />
                            Acknowledge & Return to Base
                        </Link>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

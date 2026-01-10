
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const
        }
    }
};

const FAQItem = ({ faq, index }: { faq: { question: string, answer: string }, index: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden hover:border-nexus-green/30 transition-colors"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left group"
            >
                <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-nexus-green' : 'text-white'}`}>
                    {faq.question}
                </span>
                <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <Icon icon="mdi:chevron-down" className={`text-2xl ${isOpen ? 'text-nexus-green' : 'text-gray-500'}`} />
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function AboutUs() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-nexus-black text-white selection:bg-nexus-green selection:text-black overflow-hidden relative">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-nexus-green/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-125 h-125 bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">

                {/* Hero Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-32"
                >
                    <motion.div variants={itemVariants} className="inline-block mb-4">
                        <span className="px-4 py-1.5 rounded-full border border-nexus-green/30 bg-nexus-green/10 text-nexus-green text-sm font-bold tracking-wider uppercase">
                            The Revolution is Here
                        </span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-9xl font-black mb-8 tracking-tighter leading-none">
                        BEYOND <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-nexus-green via-white to-purple-500">
                            EDUCATION
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
                        We aren't just a platform. We are the <span className="text-white font-bold">dopamine-fueled engine</span> of your future success. Nexus4D merges high-octane gamification with elite-tier education.
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <button
                            onClick={() => navigate('/courses')}
                            className="group relative px-8 py-4 bg-nexus-green text-black font-black text-lg uppercase tracking-wider overflow-hidden rounded-xl perspective-distant hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] transition-all duration-300"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Start Learning <Icon icon="mdi:arrow-right" className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform origin-bottom" />
                        </button>
                    </motion.div>
                </motion.div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                    {[
                        {
                            icon: "mdi:lightning-bolt",
                            color: "text-yellow-400",
                            title: "Hyper-Speed Learning",
                            desc: "Forget boring lectures. Our micro-learning modules are designed for rapid absorption and instant application."
                        },
                        {
                            icon: "mdi:controller",
                            color: "text-nexus-green",
                            title: "Gamified Mastery",
                            desc: "Level up, earn XP, and unlock rewards. We turned studying into an addictive RPG where YOU are the main character."
                        },
                        {
                            icon: "mdi:account-group",
                            color: "text-purple-400",
                            title: "Elite Community",
                            desc: "Join a squad of high-performers. Compete on leaderboards and collaborate with the best minds in the game."
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors group"
                        >
                            <div className={`text-5xl mb-6 ${feature.color} drop-shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <Icon icon={feature.icon} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* The "Why" Section */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2"
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                            OLD SCHOOL IS <br />
                            <span className="text-red-500 line-through decoration-4 decoration-white">OBSOLETE</span>
                        </h2>
                        <p className="text-lg text-gray-400 mb-6">
                            The traditional education system was built for a world that no longer exists. It's slow, rigid, and frankly, boring.
                        </p>
                        <p className="text-lg text-gray-400 mb-8">
                            Nexus4D is the antidote. We use cutting-edge cognitive science and game design principles to keep you in a state of flow. Every click, every quiz, every completed chapter triggers a rush of accomplishment.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-white">94%</span>
                                <span className="text-sm text-gray-500 uppercase tracking-widest">Completion Rate</span>
                            </div>
                            <div className="w-px bg-white/20 h-16 mx-4" />
                            <div className="flex flex-col">
                                <span className="text-4xl font-black text-white">10k+</span>
                                <span className="text-sm text-gray-500 uppercase tracking-widest">Active Learners</span>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 relative"
                    >
                        <div className="relative z-10 bg-linear-to-br from-gray-900 to-black border border-white/10 rounded-3xl p-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="absolute -top-10 -right-10 text-9xl text-white/5 font-black z-0 pointer-events-none">X</div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Project Nexus</h3>
                            <div className="h-2 w-20 bg-nexus-green mb-6 rounded-full" />
                            <p className="text-gray-400 italic">"I learned more in 3 weeks on Nexus4D than I did in 3 years of college. The gamification isn't a gimmick; it's the future."</p>
                            <div className="mt-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden">
                                    {/* Placeholder Avatar */}
                                    {/* <Icon icon="mdi:account" className="w-full h-full text-gray-500 p-2" /> */}
                                    <img src="/Icons/F Smoothie Nexon.png" className="w-full h-full p-1" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">Sarah Jenkins</div>
                                    <div className="text-xs text-nexus-green">Full Stack Developer</div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements behind */}
                        <div className="absolute inset-0 bg-nexus-green/20 blur-3xl -z-10" />
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-6">FREQUENTLY ASKED <span className="text-nexus-green">DATA</span></h2>
                        <div className="w-20 h-1 bg-nexus-green mx-auto rounded-full" />
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                question: "What exactly is Nexus 4D?",
                                answer: "Nexus 4D is the premiere platform for gamified learning. We've replaced boring lectures with high-octane missions. You don't just learn; you ascend. We combine elite-tier education with the addictive progression systems of RPGs."
                            },
                            {
                                question: "How do I earn Rewards & Avatars?",
                                answer: "Every action has a reaction. Complete chapters and quizzes to earn XP. Master full courses to unlock rare 'Nexon' avatars. The more you learn, the more legendary your digital identity becomes on the global leaderboard."
                            },
                            {
                                question: "Can I share my own knowledge?",
                                answer: "Absolutely. We are always recruiting elite Tutors. If you have the expertise, apply to the Faculty via your dashboard. Build your curriculum, set your terms, and monetize your skills while building a following."
                            },
                            {
                                question: "Is this platform free to access?",
                                answer: "Initialization is free. You can join the network, browse missions, and customize your profile at no cost. Specific Premium courses and exclusive content drops may require enrollment fees, directly supporting our creators."
                            }
                        ].map((faq, index) => (
                            <FAQItem key={index} faq={faq} index={index} />
                        ))}
                    </div>
                </div>

                {/* Team / Join Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center bg-linear-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-12 md:p-24"
                >
                    <Icon icon="mdi:rocket-launch" className="text-6xl text-nexus-green mx-auto mb-6 animate-pulse" />
                    <h2 className="text-4xl md:text-6xl font-black mb-6">READY TO ASCEND?</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        The leaderboard is calling. Your potential is limitless. Stop waiting for permission to be great.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="px-8 py-4 bg-white text-black font-black text-lg rounded-xl hover:scale-105 transition-transform"
                        >
                            Get Started Free
                        </button>
                        <button
                            onClick={() => navigate('/courses')}
                            className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-colors"
                        >
                            Browse Courses
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

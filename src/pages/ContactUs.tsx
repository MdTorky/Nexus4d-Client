
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

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

import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function ContactUs() {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/contact', formData);

            // Simulate delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));

            showToast(t('contact.toast.success'), 'success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            showToast(t('contact.toast.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-nexus-black text-white selection:bg-nexus-green selection:text-black overflow-hidden relative">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-nexus-green/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">

                {/* Header */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center mb-24"
                >
                    <motion.div variants={itemVariants} className="inline-block mb-4">
                        <span className="px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold tracking-wider uppercase">
                            {t('contact.openFrequency')}
                        </span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-none">
                        {t('contact.header.title1')} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-nexus-green">
                            {t('contact.header.title2')}
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('contact.header.subtitle')}
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 bg-nexus-green/20 rounded-lg flex items-center justify-center text-nexus-green mb-4 group-hover:scale-110 transition-transform">
                                <Icon icon="mdi:email-fast" className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('contact.directUplink.title')}</h3>
                            <p className="text-gray-400 mb-4">{t('contact.directUplink.desc')}</p>
                            <a href="mailto:hello@nexus4d.com" className="text-white font-mono hover:text-nexus-green transition-colors">nexus4d.academy@gmail.com</a>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                                <Icon icon="mdi:discord" className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('contact.joinHive.title')}</h3>
                            <p className="text-gray-400 mb-4">{t('contact.joinHive.desc')}</p>
                            <a href="#" className="flex items-center gap-2 text-white font-bold hover:text-purple-400 transition-colors">
                                {t('contact.joinHive.cta')} <Icon icon={`mdi:arrow-${i18n.language === "en" ? "right" : "left"}`} />
                            </a>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors group">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                                <Icon icon="mdi:map-marker" className="text-2xl" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{t('contact.hqCoordinates.title')}</h3>
                            <p className="text-gray-400 whitespace-pre-line">
                                {t('contact.hqCoordinates.desc')}
                            </p>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-black/40 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl relative"
                    >
                        <div className={`absolute top-0  p-4 opacity-20 pointer-events-none ${i18n.language === "en" ? "right-0" : "left-0"}`}>
                            <Icon icon="mdi:message-processing" className="text-9xl text-white" />
                        </div>

                        <h2 className="text-2xl font-bold mb-6">{t('contact.form.title')}</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">{t('contact.form.identity')}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none transition-all"
                                        placeholder={t('contact.form.identityPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">{t('contact.form.email')}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none transition-all"
                                        placeholder={t('contact.form.emailPlaceholder')}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('contact.form.subject')}</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange as any}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none transition-all appearance-none"
                                >
                                    <option value="" disabled>{t('contact.form.subjectPlaceholder')}</option>
                                    <option value="support" className="bg-gray-900">{t('contact.form.subjects.support')}</option>
                                    <option value="partnership" className="bg-gray-900">{t('contact.form.subjects.partnership')}</option>
                                    <option value="billing" className="bg-gray-900">{t('contact.form.subjects.billing')}</option>
                                    <option value="other" className="bg-gray-900">{t('contact.form.subjects.other')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">{t('contact.form.message')}</label>
                                <textarea
                                    name="message"
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-nexus-green focus:ring-1 focus:ring-nexus-green outline-none transition-all resize-none"
                                    placeholder={t('contact.form.messagePlaceholder')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-nexus-green text-black font-bold text-lg rounded-xl hover:bg-nexus-green/90 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Icon icon="mdi:loading" className="animate-spin text-xl" />
                                        {t('contact.form.submitting')}
                                    </>
                                ) : (
                                    <>
                                        <Icon icon="mdi:send" />
                                        {t('contact.form.submit')}
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

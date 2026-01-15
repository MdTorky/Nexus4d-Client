
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

export default function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="w-full border-t border-white/10 bg-black pt-16 pb-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-50%] left-[20%] w-[500px] h-[500px] bg-nexus-green/5 rounded-full blur-[120px]" />
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="block w-32">
                            <img src="/Logo Horizontal.png" alt="Nexus 4D" className="w-full object-contain" />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            {t('footer.brandText')}
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            {[
                                { icon: 'mdi:instagram', href: 'https://www.instagram.com/nexus_4d/' },
                                { icon: 'prime:twitter', href: 'https://twitter.com' },
                                { icon: 'mdi:linkedin', href: 'https://www.linkedin.com/company/nexus-4d' }
                            ].map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-nexus-green hover:text-black transition-all duration-300 hover:scale-110"
                                >
                                    <Icon icon={social.icon} className="text-xl" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6">{t('footer.discovery')}</h3>
                        <ul className="space-y-4">
                            {[
                                { label: t('footer.links.courses'), path: '/courses' },
                                // { label: 'Tutors', path: '/tutors' },
                                { label: t('footer.links.about'), path: '/about' },
                                { label: t('footer.links.contact'), path: '/contact' }
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-nexus-green transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal/Support */}
                    <div>
                        <h3 className="text-white font-bold mb-6">{t('footer.support')}</h3>
                        <ul className="space-y-4">
                            {[
                                // { label: 'Help Center', path: '#' },
                                { label: t('footer.links.terms'), path: '/terms' },
                                { label: t('footer.links.privacy'), path: '/privacy' },
                                { label: t('footer.links.becomeTutor'), path: '/tutor-application' }
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-nexus-green transition-colors text-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter/Action */}
                    <div>
                        <h3 className="text-white font-bold mb-6">{t('footer.stayUpdated')}</h3>
                        <p className="text-gray-400 text-sm mb-4">{t('footer.newsletterText')}</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder={t('footer.emailPlaceholder')}
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-nexus-green w-full"
                            />
                            <button className="bg-nexus-green text-black px-4 py-2 rounded-lg font-bold hover:bg-nexus-green/90 transition-colors">
                                <Icon icon={`mdi:arrow-${i18n.language === "en" ? "right" : "left"}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} {t('footer.rightsReserved')}
                    </p>
                    <div className="flex gap-8">
                        <span className="text-gray-500 text-xs flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {t('footer.systemsOperational')}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

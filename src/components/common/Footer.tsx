
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function Footer() {
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
                            The next evolution in gamified education. Master complex skills through immersive, dopamine-driven learning experiences.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            {['mdi:twitter', 'mdi:instagram', 'mdi:discord', 'mdi:linkedin'].map((icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-nexus-green hover:text-black transition-all duration-300 hover:scale-110"
                                >
                                    <Icon icon={icon} className="text-xl" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6">Discovery</h3>
                        <ul className="space-y-4">
                            {[
                                { label: 'Courses', path: '/courses' },
                                // { label: 'Tutors', path: '/tutors' },
                                { label: 'About Us', path: '/about' },
                                { label: 'Contact', path: '/contact' }
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
                        <h3 className="text-white font-bold mb-6">Support</h3>
                        <ul className="space-y-4">
                            {[
                                // { label: 'Help Center', path: '#' },
                                { label: 'Terms of Service', path: '#' },
                                { label: 'Privacy Policy', path: '#' },
                                { label: 'Become a Tutor', path: '/tutor-application' }
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
                        <h3 className="text-white font-bold mb-6">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-4">Join our newsletter for the latest course drops and XP events.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-nexus-green w-full"
                            />
                            <button className="bg-nexus-green text-black px-4 py-2 rounded-lg font-bold hover:bg-nexus-green/90 transition-colors">
                                <Icon icon="mdi:arrow-right" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} Nexus 4D. All rights reserved.
                    </p>
                    <div className="flex gap-8">
                        <span className="text-gray-500 text-xs flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Systems Operational
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

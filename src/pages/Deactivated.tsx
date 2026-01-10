import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function Deactivated() {
    const [searchParams] = useSearchParams();
    const reason = searchParams.get('reason');

    return (
        <div className="min-h-screen flex items-center justify-center bg-nexus-black px-4">
            <div className="max-w-lg w-full bg-nexus-card border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-red-900/10">
                <div className="bg-red-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon icon="mdi:account-off" className="text-red-500 text-4xl" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Account Deactivated</h1>
                <p className="text-gray-400 mb-6">
                    Your account has been deactivated by an administrator. You can no longer access the platform.
                </p>

                {reason && (
                    <div className="bg-black/40 border border-white/5 rounded-lg p-4 mb-6 text-left">
                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reason provided:</span>
                        <p className="text-white mt-1 italic">"{reason}"</p>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-sm text-gray-400">
                        If you believe this is a mistake, please contact our support team.
                    </p>
                    <a
                        href="mailto:nexus4d.academy@gmail.com"
                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                        <Icon icon="mdi:email" /> Contact Support
                    </a>
                    <div className="pt-4">
                        <Link to="/login" className="text-nexus-green hover:underline text-sm">Return to Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../ui/Button';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

interface GoogleAuthButtonProps {
    onSuccess: (response: any) => void;
    onError?: () => void;
    text?: string;
    isLoading?: boolean;
}

export default function GoogleAuthButton({ onSuccess, onError, text, isLoading }: GoogleAuthButtonProps) {
    const { t } = useTranslation();

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => onSuccess(codeResponse),
        onError: () => onError && onError(),
    });

    return (
        <Button
            type="button"
            onClick={() => login()}
            disabled={isLoading}
            className="w-full py-4 font-bold bg-white text-black hover:bg-gray-200 transition-all flex items-center justify-center gap-3 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
        >
            <Icon icon="devicon:google" width={24} height={24} />
            <span className="uppercase tracking-wider text-sm">{text || t('auth.continueWithGoogle')}</span>
        </Button>
    );
}

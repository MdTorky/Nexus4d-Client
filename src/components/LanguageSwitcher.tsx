import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Button } from './ui/Button';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ar' : 'en';
        i18n.changeLanguage(newLang);
    };

    useEffect(() => {
        document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    return (
        <Button
            variant="outline"
            onClick={toggleLanguage}
            className="cursor-pointer px-3 py-1 text-sm bg-nexus-card/80 backdrop-blur-sm border-nexus-green/20 hover:border-nexus-green text-nexus-white"
        >
            {i18n.language === 'en' ? 'العربية' : 'English'}
        </Button>
    );
}

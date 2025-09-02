import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useAuthStore } from '../stores/authStore';

export default function Header() {
  const {lang, setLang, t} = useI18n();
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 h-[88px] z-10 bg-white/80 border-[#E2E8F0] backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="inline-block h-6 w-6 rounded bg-cyan-500"/>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setLang('uz')}
                    className={`text-sm rounded px-2 py-1 ring-1 ${lang === 'uz' ? 'bg-cyan-600 text-white ring-cyan-600' : 'ring-gray-300 hover:bg-gray-50'}`}>{t('language.uz')}</button>
            <button onClick={() => setLang('ru')}
                    className={`text-sm rounded px-2 py-1 ring-1 ${lang === 'ru' ? 'bg-cyan-600 text-white ring-cyan-600' : 'ring-gray-300 hover:bg-gray-50'}`}>{t('language.ru')}</button>
          </div>
          <div className="flex items-center gap-3">
            <img className="h-9 w-9 rounded-full object-cover"
                 src="https://images.unsplash.com/photo-1614286309240-0840d43d651d?q=80&w=400&auto=format&fit=crop"
                 alt="avatar"/>
            <div className="leading-tight">
              <div className="font-semibold">{user?.name || '—'}</div>
              <div className="text-gray-500 text-sm">{user?.position || 'Unknown'}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

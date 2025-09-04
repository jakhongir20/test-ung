import { useAuthStore } from '../stores/authStore';
import { LanguageSelect } from "./LanguageSelect.tsx";

export default function Header() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-10 bg-white/80 border-[#E2E8F0] backdrop-blur border-b">
      <div className={'max-w-7xl mx-auto px-4 md:px-8'}>
        <div className="flex  items-center w-full justify-between   py-3">
          <div className="flex items-center gap-2 text-xl font-bold text-orange-600">
            <img className="w-[162px]" alt="logo" src="/logo.svg"/>
          </div>
          <div className={'flex gap-6'}>
            <LanguageSelect/>
            <div className="flex items-center gap-3">
              <img
                className="h-9 w-9 rounded-full object-cover"
                src="https://images.unsplash.com/photo-1614286309240-0840d43d651d?q=80&w=400&auto=format&fit=crop"
                alt="avatar"
                onError={e => {
                  e.currentTarget.src = "/avatar-default.png";
                }}
              />
              <div className="leading-tight">
                <div className="font-semibold">{user?.name || '—'}</div>
                <div className="text-gray-500 text-sm">{user?.position || 'Unknown'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

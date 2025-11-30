import { LanguageSelect } from "./LanguageSelect.tsx";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { logout } from "../api/auth";
import { SettingsModal } from "./SettingsModal";
import { useUsersMeRetrieve } from "../api/generated/respondentWebAPI";
import type { User } from "../api/generated/models/user";

export default function Header() {
  const { t, lang } = useI18n();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user data from /api/users/me/ endpoint
  const { data: userData } = useUsersMeRetrieve();


  // Get the position name from user data according to current language
  const getPositionName = (): string => {
    if (!userData) return '';

    const user: User = userData;

    // Try to get position from employee_data first
    if ((user as any).employee_data?.position) {
      return (user as any).employee_data.position;
    }

    // Fallback to old position fields for backward compatibility
    const localized =
      lang === 'uz'
        ? (user.position_name_uz || user.position_name_uz_cyrl || user.position_name_ru || user.position_name)
        : lang === 'uz-cyrl'
          ? (user.position_name_uz_cyrl || user.position_name_uz || user.position_name_ru || user.position_name)
          : (user.position_name_ru || user.position_name_uz || user.position_name_uz_cyrl || user.position_name);

    if (localized) {
      return localized;
    }

    // Fallback to position field if position_name is not available
    if ((user as any).position) {
      return String((user as any).position);
    }

    return '';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="relative top-0 z-50 bg-white/80 border-[#E2E8F0] backdrop-blur border-b">
      <div className={'max-w-7xl mx-auto px-4 md:px-8'}>
        <div className="flex  items-center w-full justify-between py-3">
          <Link to={'/'} className="flex items-center gap-2 text-xl font-bold text-orange-600">
            <img className=" w-[180px] md:w-[252px]" alt="logo" src="/logo.svg" />
          </Link>
          <div className={'flex items-center gap-0 md:gap-4'}>
            <LanguageSelect />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center md:gap-3 gap-1 hover:bg-gray-50 rounded-lg md:p-2 p-1 transition-colors duration-200"
              >
                <img
                  className="h-9 w-9 rounded-full object-cover"
                  src="https://images.unsplash.com/photo-1614286309240-0840d43d651d?q=80&w=400&auto=format&fit=crop"
                  alt="avatar"
                  onError={e => {
                    e.currentTarget.src = "/avatar-default.png";
                  }}
                />
                <div className="leading-tight text-left md:block hidden">
                  <div className="font-semibold">{userData?.name || '—'}</div>
                  <div className="text-gray-500 text-base max-w-[100px] truncate" title={getPositionName()}>
                    {getPositionName()}
                  </div>
                </div>
                <ChevronDownIcon
                  className={`h-6 w-6 transition-transform duration-200 text-gray-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />

              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute right-0 w-[200px] md:w-[250px] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="flex items-center w-full md:px-4 px-2 py-1.5 md:py-3 text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('header.myProfile')}
                  </button>
                  {userData?.is_moderator && <Link
                    to="/admin/employees"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center md:px-4 px-2 py-1.5 md:py-3 text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    {t('header.adminEmployees')}
                  </Link>}
                  {userData?.is_moderator && <Link
                    to="/admin/create-candidate"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center md:px-4 px-2 py-1.5 md:py-3 text-sm md:text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    {t('header.createCandidate')}
                  </Link>}

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center w-full md:px-4 px-2 py-1.5 md:py-3 text-sm md:text-base text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </header>
  );
}

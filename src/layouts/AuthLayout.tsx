import { Outlet } from "react-router-dom";
import { LanguageSelect } from "../components/LanguageSelect.tsx";
import { useI18n } from "../i18n";

export default function AuthLayout() {
  const {t} = useI18n();

  return (
    <div className="grid  grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_1.3fr] ">
      <div className="flex flex-col justify-center items-center rounded-xl mb-[130px]">
        <div className={'mb-6'}>
          <div className="flex items-center justify-center mb-8 md:mb-10 gap-2 text-xl font-bold text-orange-600">
            <img src="/logo.svg" className="w-[350px] md:w-[380px]" alt="logo"/>
          </div>
          <Outlet/>
          <div className="flex text-[#90A1B9] mt-3 text-sm px-6 justify-between">
            <a href={'#'}>{t('auth.contactSpecialist')}</a>
            <a href={''}>{t('auth.offer')}</a>
          </div>
        </div>
        <LanguageSelect authlayout/>
      </div>

      <div className="hidden md:flex justify-center h-auto rounded-xl mb-[130px]">
        <img
          src="/login_bg_image.png"
          alt="promo"
          className="max-w-[100%] object-contain"
        />
      </div>
    </div>
  );
}



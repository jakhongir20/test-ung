import { Outlet } from "react-router-dom";
import { LanguageSelect } from "../components/LanguageSelect.tsx";

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 gap-4 p-4 md:grid-cols-[1fr_1.3fr]">

      <div className="flex flex-col justify-between items-center  rounded-xl">
        <div className="flex items-center w-full justify-between  md:px-7 py-2">
          <div className="flex items-center gap-2 text-xl font-bold text-orange-600">
            <img src="/logo.svg" className="w-[150px] md:w-[252px]" alt="logo"/>
          </div>
          <LanguageSelect/>
        </div>
        <div>
          <Outlet/>
          <div className="flex text-[#90A1B9] mt-3 text-sm px-6 justify-between">
            <a href={'#'}>Связь со специалистом</a>
            <a href={''}>Оферта</a>
          </div>
        </div>
        <span></span>
      </div>

      <div className="hidden md:flex justify-center items-center rounded-xl">
        <img
          src="/login_bg_image.png"
          alt="promo"
          className="max-w-[100%]"
        />
      </div>
    </div>
  );
}



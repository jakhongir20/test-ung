import type { FC } from 'react';

const CertificatePage: FC = () => {
  // Static certificate information (will be replaced with API data later)
  const userName = 'Rajabov Davron Yoʻldoshevich';
  const userPosition = 'Mahallabay iste\'molchilar bilan ishlash boʻlimi yetakchi muhandisi';
  const userBranch = 'Hududgaz Sirdaryo';
  const certificateNumber = '0001';

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/certificate_bg.png)',
        backgroundSize: '100% 100%'
      }}
    >
      <div className="relative w-full h-screen flex flex-col justify-center items-center p-12">
        {/* Certificate Number - Top Left */}
        <div className="absolute top-12 left-12 text-gray-600 font-semibold text-xl">
          № {certificateNumber}
        </div>

        {/* Logo and Company Name - Top Center */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
          <div className="flex items-center justify-center mb-3">
            {/* Logo - Blue house with orange flame */}
            <div className="relative mr-4">
              <div className="w-16 h-12 bg-blue-600 rounded-t-lg"></div>
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-orange-500 rounded-full"></div>
            </div>
            <div>
              <div className="text-orange-500 font-bold text-2xl">HUDUDGAZTA'MINOT</div>
              <div className="text-gray-600 text-base">HGT AKSIYADORLIK JAMIYATI</div>
            </div>
          </div>
        </div>

        {/* Certificate Number - Top Right */}
        <div className="absolute top-12 right-12 text-gray-600 font-semibold text-xl">
          № {certificateNumber}-
        </div>

        {/* Main Certificate Content */}
        <div className="text-center max-w-5xl mx-auto mt-16">
          {/* Main Text */}
          <div className="text-gray-700 text-xl leading-relaxed mb-8">
            <p className="mb-4">
              "Hududgazta'minot" AJ ning <strong>"HGT-Malaka"</strong> tizimida test-
              sinovini muvaffaqiyatli topshirganligi uchun
            </p>
            <p>
              "{userBranch}" gaz ta'minoti filiali {userPosition}
            </p>
          </div>

          {/* User Name */}
          <div className="text-blue-800 font-bold text-4xl mb-12">
            {userName}
          </div>

          {/* Certificate Title */}
          <div className="text-red-600 font-bold text-8xl mb-6">
            SERTIFIKAT
          </div>

          {/* Award Text */}
          <div className="text-black text-2xl">
            bilan taqdirlanadi
          </div>
        </div>

        {/* QR Code Section - Bottom */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-blue-800 font-bold text-3xl mb-6">QR-kod</div>
          {/* QR Code placeholder - you can replace with actual QR code */}
          <div className="w-40 h-40 bg-white border-2 border-gray-300 flex items-center justify-center shadow-lg">
            <div className="text-gray-400 text-sm">QR Code</div>
          </div>
        </div>

        {/* Date - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-600 text-base">
          Toshkent 2025
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;

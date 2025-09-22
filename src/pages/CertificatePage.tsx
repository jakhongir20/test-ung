import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCertificateData, downloadCertificate, type CertificateData } from '../api/certificate';

const CertificatePage: FC = () => {
  const { id } = useParams<{ id: string; }>();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch certificate data
  useEffect(() => {
    const loadCertificateData = async () => {
      if (!id) {
        setError('Certificate ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCertificateData(parseInt(id));
        setCertificateData(data);
      } catch (err: any) {
        console.error('Error fetching certificate data:', err);
        setError(err?.response?.data?.message || 'Failed to load certificate data');
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificateData();
  }, [id]);

  // Handle certificate download
  const handleDownload = async () => {
    if (!id || !certificateData) return;

    try {
      setIsDownloading(true);
      const blob = await downloadCertificate(parseInt(id));

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${certificateData.user.name}_${certificateData.certificate_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading certificate:', err);
      setError('Failed to download certificate');
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A2DE] mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading certificate...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Certificate not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested certificate could not be loaded.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const userName = certificateData.user.name;
  const userPosition = certificateData.user.position;
  const userBranch = certificateData.user.branch;
  const certificateNumber = certificateData.certificate_number;

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

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Certificate
              </>
            )}
          </button>
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

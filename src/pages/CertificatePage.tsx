import type { FC, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { fetchCertificateData, downloadCertificate, type CertificateData } from '../api/certificate';
import { useI18n, type LanguageCode } from '../i18n';

type AxiosErrorLike = {
  response?: {
    data?: unknown;
    status?: number;
  };
  message?: string;
};

const stringifyBackendResponse = (data: unknown): string | null => {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    const message = (data as { message?: unknown; detail?: unknown; error?: unknown; }).message
      ?? (data as { detail?: unknown; }).detail
      ?? (data as { error?: unknown; }).error;
    if (typeof message === 'string') {
      return message;
    }
    try {
      return JSON.stringify(data);
    } catch {
      return null;
    }
  }
  return String(data);
};

const formatCertificateError = (err: unknown, fallbackMessage: string): string => {
  const axiosError = err as AxiosErrorLike;
  const backendResponse = stringifyBackendResponse(axiosError?.response?.data);
  const statusCode = axiosError?.response?.status;
  const errorMessage = axiosError?.message;
  const parts: string[] = ['Failed to certificate'];

  if (backendResponse) {
    parts.push(`Backend response: ${backendResponse}`);
  }
  parts.push(`Status code: ${statusCode ?? 'unknown'}`);

  if (errorMessage?.includes('ERR_CONNECTION_REFUSED')) {
    parts.push('(ошибка) net::ERR_CONNECTION_REFUSED');
  }

  const message = parts.join('. ');
  return message || fallbackMessage;
};

const BORDER_DECORATION = (
  <svg
    aria-hidden
    viewBox="0 0 400 400"
    preserveAspectRatio="none"
    className="absolute inset-0 w-full h-full pointer-events-none"
  >
    <rect x="14" y="14" width="372" height="372" fill="none" stroke="#b2b9c9" strokeWidth="4" rx="18" />
    <rect x="6" y="6" width="388" height="388" fill="none" stroke="#d8dbe2" strokeWidth="2" rx="24" />
  </svg>
);

const DecorativeLabel: FC<{ children: ReactNode; position: 'left' | 'right'; value: string | number; }> = ({
  children,
  position,
  value
}) => (
  <div
    className={`absolute top-16 text-[#51617a] font-bold tracking-wide flex items-center gap-3 ${position === 'left' ? 'left-16' : 'right-16 flex-row-reverse'
      }`}
  >
    <span className="text-xl">№</span>
    <span className="text-xl font-bold">{value}</span>
    <span className="text-base uppercase tracking-[0.35em]">{children}</span>
  </div>
);

const CertificatePage: FC = () => {
  const { id } = useParams<{ id: string; }>();
  const [searchParams] = useSearchParams();
  const { t, lang, setLang } = useI18n();
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Set language from URL parameter if provided
  useEffect(() => {
    const langParam = searchParams.get('lang');
    if (langParam && (langParam === 'uz' || langParam === 'uz-cyrl' || langParam === 'ru')) {
      setLang(langParam as LanguageCode);
    }
  }, [searchParams, setLang]);

  // Generate certificate URL for QR code using base domain from env or fallback
  const certificateUrl = useMemo(() => {
    if (!id) return '';
    // Use environment variable for base URL, fallback to window.location.origin for development
    const baseUrl = window.location.origin;
    return `${baseUrl}/certificate/${id}?lang=${lang}`;
  }, [id, lang]);

  useEffect(() => {
    const loadCertificateData = async () => {
      if (!id) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCertificateData(id);
        setCertificateData(data);
      } catch (err) {
        setError(formatCertificateError(err, 'Failed to load certificate data'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificateData();
  }, [id]);

  const handleDownload = async () => {
    if (!id || !certificateData) return;

    try {
      setIsDownloading(true);
      const blob = await downloadCertificate(id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${certificateData.user_name}_${certificateData.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatCertificateError(err, 'Failed to download certificate'));
    } finally {
      setIsDownloading(false);
    }
  };

  const completedAt = certificateData?.completed_at ?? null;

  const formattedCompletionDate = useMemo(() => {
    if (!completedAt) {
      return lang === 'ru' ? 'Ташкент 2025' : 'Toshkent 2025';
    }
    try {
      const locale = lang === 'ru' ? 'ru-RU' : lang === 'uz-cyrl' ? 'uz-Cyrl-UZ' : 'uz-Latn-UZ';
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(completedAt));
    } catch {
      return completedAt;
    }
  }, [completedAt, lang]);


  const isButtonHidden = searchParams.has('hiddenButton');
  const containerSpacingClass = isButtonHidden ? 'py-6 gap-4 justify-center' : 'py-10 gap-10';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f4f8]">
        <div className="text-center text-[#51617a]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#00A2DE]/60 border-t-[#00A2DE] mx-auto mb-3" />
          <p className="text-lg font-medium">{t('certificate.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !certificateData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f4f8]">
        <div className="bg-white shadow-xl rounded-2xl px-12 py-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-5 bg-red-100 rounded-full flex items-center justify-center text-red-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('certificate.notFound')}</h2>
          <p className="text-gray-600 mb-6">
            {error || t('certificate.notFoundMessage')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#00A2DE] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#0093c8]"
          >
            {t('certificate.retry')}
          </button>
        </div>
      </div>
    );
  }

  const {
    user_name: userName,
    user_position: userPosition,
    certificate_order: certificateNumber
  } = certificateData;

  return (
    <div className={`min-h-screen bg-[#e5ebf4] flex flex-col items-center ${containerSpacingClass}`}>
      <div className="relative w-[1120px] max-w-[95vw] aspect-[16/10] bg-white shadow-[0_25px_65px_rgba(25,42,87,0.18)] border border-[#d7dbe4] rounded-[28px]">
        <div className="absolute inset-0">
          <img src="/certificate_bg.png" alt="" className="w-full h-full object-cover opacity-90" />
          {BORDER_DECORATION}
        </div>

        <div className="relative h-full w-full px-24 py-20">
          <DecorativeLabel position="left" value={certificateNumber}>
            {t('certificate.order')}
          </DecorativeLabel>
          <DecorativeLabel position="right" value={certificateNumber}>
            {t('certificate.number')}
          </DecorativeLabel>

          <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center">
            <div className="flex items-center gap-4 justify-center text-[#0b5ca8]">
              <img src="/logo.svg" alt="" className=" h-16" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-full pt-16 pb-24">
            <div className="text-[#485a75] text-2xl text-center max-w-3xl leading-relaxed tracking-wide">
              <p className="">
                {t('certificate.successMessage')}
              </p>
              {userPosition && (
              <p>
                  <span className="font-medium">{userPosition}</span>
              </p>
              )}
            </div>

            <div className="text-[#244a74] font-extrabold text-[44px] tracking-[0.08em] uppercase mb-4">
              {userName}
            </div>

            <div className="text-[#c2271d] font-black text-[62px] tracking-[0.2em] uppercase leading-none mb-4">
              {t('certificate.title')}
            </div>

            <div className="text-[#1f2f45] text-[18px] tracking-[0.3em] uppercase">
              {t('certificate.awarded')}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-16 flex items-center justify-center gap-20">
            <div className="text-center">
              <div className="text-[#244a74] font-semibold text-xl tracking-[0.4em] uppercase mb-3">
                {t('certificate.qrCode')}
              </div>
              <div className="w-24 h-24 mx-auto bg-white border-2 border-[#ced7e4] rounded-xl shadow-[0_10px_25px_rgba(36,74,116,0.18)] flex items-center justify-center p-2">
                {certificateUrl && (
                  <QRCodeSVG
                    value={certificateUrl}
                    size={80}
                    level="H"
                    includeMargin={false}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="absolute bottom-16 left-16 text-[#4d607f] font-bold tracking-[0.4em] uppercase">
            {lang === 'ru' ? 'Ташкент' : 'Toshkent'} {formattedCompletionDate}
          </div>
          <div className="absolute bottom-16 right-16 text-[#4d607f] font-bold tracking-[0.4em] uppercase">
            № {certificateNumber}
          </div>
        </div>
      </div>

      {!isButtonHidden && (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center gap-3 bg-gradient-to-r from-[#0b5ca8] to-[#1d7fd1] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-70 disabled:cursor-wait"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('certificate.downloading')}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {t('certificate.downloadButton')}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CertificatePage;

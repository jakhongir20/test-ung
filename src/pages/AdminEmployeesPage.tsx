import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useModeratorUserDetails, useModeratorUsers } from '../api/moderator';
import { useGtfRetrieve, usePositionsRetrieve } from '../api/generated/respondentWebAPI';
import { useI18n } from '../i18n';
import { customInstance } from '../api/mutator/custom-instance';
import { MyProfileBanner } from "../components/MyProfileBanner.tsx";
import type { Column } from "../components/DataTable.tsx";
import { DataTable } from "../components/DataTable.tsx";
import { CARD_STYLES } from "../components/test/test.data.ts";
import { StatusBadge } from "../components/StatusBadge.tsx";
import { ProfileCardItem } from "../components/ProfileCardItem.tsx";
import { BackgroundWrapper } from "../components/BackgroundWrapper.tsx";
import { ConfirmationModal } from "../components/ConfirmationModal.tsx";
import { PageTransition } from "../components/animations";
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';


const AdminEmployeesPage: FC = () => {
  const { t, lang } = useI18n();
  const [branch, setBranch] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [testStatus, setTestStatus] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [search] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [certificateModal, setCertificateModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: ''
  });

  // Prevent body scrolling when drawer or modal is open
  useBodyScrollLock(!!selectedUserId || certificateModal.isOpen);

  // API query parameters
  const queryParams = useMemo(() => ({
    branch: branch || undefined,
    position: position || undefined,
    search: search || undefined,
    status: testStatus || undefined,
  }), [branch, position, search, testStatus]);

  // Fetch users list
  const usersQuery = useModeratorUsers(queryParams);
  const usersData = usersQuery.data as any;
  const users = usersData?.results || usersData || [];

  // Fetch GTF and Positions lists to get IDs
  const { data: gtfData } = useGtfRetrieve();
  const { data: positionsData } = usePositionsRetrieve();

  // Fetch selected user details
  const userDetailsQuery = useModeratorUserDetails(selectedUserId ?? undefined);

  const selectedUser = userDetailsQuery.data;

  // Helper function to get localized name
  const getLocalizedName = useMemo(() => (item: any) => {
    switch (lang) {
      case 'uz':
        return item.name_uz || item.name_uz_cyrl || item.name_ru || 'N/A';
      case 'uz-cyrl':
        return item.name_uz_cyrl || item.name_uz || item.name_ru || 'N/A';
      case 'ru':
        return item.name_ru || item.name_uz || item.name_uz_cyrl || 'N/A';
      default:
        return item.name_uz || item.name_uz_cyrl || item.name_ru || 'N/A';
    }
  }, [lang]);

  // Helper function to get localized position
  const getLocalizedPosition = useMemo(() => (user: any) => {
    switch (lang) {
      case 'uz':
        return user.position_uz || user.position_name_uz || user.position || '';
      case 'uz-cyrl':
        return user.position_uz_cyrl || user.position_name_uz_cyrl || user.position || '';
      case 'ru':
        return user.position_ru || user.position_name_ru || user.position || '';
      default:
        return user.position_ru || user.position_name_ru || user.position || '';
    }
  }, [lang]);

  // Get all available branches and positions from API (not filtered by current users)
  const branches = useMemo(() => {
    if (!gtfData?.gtf || !Array.isArray(gtfData.gtf)) return [];

    // Return all branches from API with localized names
    return gtfData.gtf
      .map((gtf: any) => ({
        id: gtf.id,
        name: getLocalizedName(gtf)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [gtfData, getLocalizedName]);

  // Helper function to get localized position label with branch
  const getLocalizedPositionLabel = useMemo(() => (position: any) => {
    const positionName = getLocalizedName(position);
    const branchName = position?.branch ? getLocalizedName(position.branch) : '';
    return branchName ? `${positionName} - ${branchName}` : positionName;
  }, [getLocalizedName]);

  const positions = useMemo(() => {
    if (!positionsData?.positions || !Array.isArray(positionsData.positions)) return [];

    // Return all positions from API with localized names and branch names
    return positionsData.positions
      .map((position: any) => ({
        id: position.id,
        name: getLocalizedPositionLabel(position)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [positionsData, getLocalizedPositionLabel]);

  // Handle Excel export
  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);

      // Map lang to API format (uz, ru, uz-cyrl)
      const apiLang = lang === 'uz-cyrl' ? 'uz-cyrl' : lang === 'ru' ? 'ru' : 'uz';

      const response = await customInstance<Blob>({
        method: 'GET',
        url: '/api/moderator/users/export/',
        params: { lang: apiLang },
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      alert(t('admin.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  // Handle certificate download
  const handleCertificateDownload = (userId: number, userName: string) => {
    setCertificateModal({
      isOpen: true,
      userId,
      userName
    });
  };

  const confirmCertificateDownload = () => {
    if (certificateModal.userId) {
      // Open certificate page with user ID and language parameter
      const langParam = lang === 'uz-cyrl' ? 'uz-cyrl' : lang;
      window.open(`/certificate/${certificateModal.userId}?lang=${langParam}`, '_blank');
    }
    setCertificateModal({
      isOpen: false,
      userId: null,
      userName: ''
    });
  };

  const cancelCertificateDownload = () => {
    setCertificateModal({
      isOpen: false,
      userId: null,
      userName: ''
    });
  };

  // Define table columns
  const columns: Column[] = [
    {
      key: 'name',
      title: t('table.name'),
      sortable: true,
      render: (value) => value || t('admin.na')
    },
    {
      key: 'branch',
      title: t('table.branch'),
      sortable: true,
      render: (_, user) => {
        const localized =
          lang === 'uz'
            ? (user.gtf_uz || user.gtf_uz_cyrl || user.gtf_ru || user.gtf)
            : lang === 'uz-cyrl'
              ? (user.gtf_uz_cyrl || user.gtf_uz || user.gtf_ru || user.gtf)
              : (user.gtf_ru || user.gtf_uz || user.gtf_uz_cyrl || user.gtf);
        return localized || t('admin.na');
      }
    },
    {
      key: 'position_name',
      title: t('table.position'),
      sortable: true,
      render: (_, user) => {
        const localized =
          lang === 'uz'
            ? (user.position_name_uz || user.position_name_uz_cyrl || user.position_name_ru || user.position_name)
            : lang === 'uz-cyrl'
              ? (user.position_name_uz_cyrl || user.position_name_uz || user.position_name_ru || user.position_name)
              : (user.position_name_ru || user.position_name_uz || user.position_name_uz_cyrl || user.position_name);
        return localized || t('admin.na');
      }
    },
    {
      key: 'total_questions',
      title: t('table.totalQuestions'),
      sortable: true,
      sortValue: (user: any) => {
        // Calculate total questions from survey history or use total_attempts as proxy
        if (user.survey_history && user.survey_history.length > 0) {
          const totalQuestions = user.survey_history.reduce((total: number, session: any) => {
            return total + (session.answers?.length || 0);
          }, 0);
          return totalQuestions || 0;
        }
        // Fallback to total_attempts if no survey history
        return user.total_attempts || 0;
      },
      render: (_, user) => {
        // Calculate total questions from survey history or use total_attempts as proxy
        if (user.survey_history && user.survey_history.length > 0) {
          const totalQuestions = user.survey_history.reduce((total: number, session: any) => {
            return total + (session.answers?.length || 0);
          }, 0);
          return totalQuestions || 0;
        }
        // Fallback to total_attempts if no survey history
        return user.total_attempts || 0;
      }
    },
    {
      key: 'total_question_count',
      title: t('table.totalQuestions30'),
      sortable: true,
    },
    {
      key: 'total_correct_answers',
      title: t('table.totalCorrectQuestions'),
      sortable: true,
    },
    {
      key: 'final_score',
      title: t('table.finalScore'),
      sortable: true,
      sortValue: (user: any) => {
        // Use best_score as final test score for sorting (as number)
        return user.best_score ? Number(user.best_score) : 0;
      },
      render: (_, user) => {
        // Use best_score as final test score
        return user.best_score ? Number(user.best_score).toFixed(2) : '0.00';
      }
    },
    {
      key: 'actions',
      title: '',
      render: (_, user) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedUserId(user.id)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-gray-200 hover:bg-gray-50"
            aria-label={t('admin.aboutEmployee')}
          >
            <img src="/icon/eye.svg" alt="" />
          </button>
          <button
            onClick={() => handleCertificateDownload(user.id, user.name)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-gray-200 hover:bg-gray-50"
            aria-label={t('certificate.downloadTitle')}
            title={t('certificate.downloadTitle')}
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      )
    }
  ];


  // Error state
  if (usersQuery.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('error.connection')}</h2>
          <p className="text-gray-600 mb-4">
            {t('error.employeeData')}
          </p>
          <button
            onClick={() => usersQuery.refetch()}
            className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>

      {selectedUserId && (
        <div
          style={{ display: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, width: '100%', height: '100%' }}
          className="!fixed inset-0 h-screen w-full top-0 bottom-0 left-0 right-0 z-[9999]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedUserId(null)} />

          {/* Drawer */}
          <div
            className="absolute right-0 top-0 bottom-0 w-[min(760px,95vw)] overflow-hidden bg-white ring-1 ring-gray-200 shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-auto p-6">
                {userDetailsQuery.isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div
                      className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : userDetailsQuery.error ? (
                  <div className="text-center text-red-600">
                    {t('admin.errorLoadingDetails')}
                  </div>
                ) : selectedUser ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div className={'flex items-center gap-4'}>
                        <h4 className="text-lg font-semibold">{t('admin.aboutEmployee')}</h4>
                        <StatusBadge status={(selectedUser as any).status || 'unknown'} />
                      </div>
                      <button
                        onClick={() => setSelectedUserId(null)}
                        className="inline-flex h-6 w-6 items-center justify-center rounded ring-1 ring-gray-200 hover:bg-gray-50"
                        aria-label={t('close')}
                      >
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-xl ring-1 ring-gray-200 p-3">
                        <div className="text-xs text-gray-500">{t('table.name')}</div>
                        <div className="font-medium">{selectedUser.name || t('admin.na')}</div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3">
                        <div className="text-xs text-gray-500">{t('table.branch')}</div>
                        <div className="font-medium">{selectedUser.branch || t('admin.na')}</div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3">
                        <div className="text-xs text-gray-500">{t('table.position')}</div>
                        <div className="font-medium">{getLocalizedPosition(selectedUser) || t('admin.na')}</div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3">
                        <div className="text-xs text-gray-500">{t('table.phone')}</div>
                        <div className="font-medium">{selectedUser.phone_number || t('admin.na')}</div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3">
                        <div className="text-xs text-gray-500">{t('table.dateJoined')}</div>
                        <div className="font-medium">
                          {selectedUser.date_joined ? new Date(selectedUser.date_joined).toLocaleDateString() : t('admin.na')}
                        </div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3">
                        <div className="text-xs text-gray-500">{t('table.lastLogin')}</div>
                        <div className="font-medium">
                          {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : t('admin.na')}
                        </div>
                      </div>
                    </div>

                    {selectedUser.total_statistics && (
                      <div className="mt-6">
                        <h5 className="text-base font-semibold mb-3">{t('admin.totalStatistics')}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                            <div className="text-xs text-gray-500">{t('admin.totalAttempts')}</div>
                            <div className="text-2xl font-bold text-cyan-700">
                              {String(selectedUser.total_statistics?.total_attempts || 0)}
                            </div>
                          </div>
                          <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                            <div className="text-xs text-gray-500">{t('admin.bestScore')}</div>
                            <div className="text-2xl font-bold text-cyan-700">
                              {Number(selectedUser.total_statistics?.best_score || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                            <div className="text-xs text-gray-500">{t('admin.completedTests')}</div>
                            <div className="text-2xl font-bold text-cyan-700">
                              {String(selectedUser.total_statistics?.completed_surveys || 0)}
                            </div>
                          </div>
                          <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                            <div className="text-xs text-gray-500">{t('admin.averageScore')}</div>
                            <div className="text-2xl font-bold text-cyan-700">
                              {Number(selectedUser.total_statistics?.average_score || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUser.survey_history && selectedUser.survey_history.length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-base font-semibold mb-3">{t('admin.testHistory')}</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedUser.survey_history.map((survey: any, index: number) => (
                            <ProfileCardItem
                              key={survey.id || index}
                              survey={survey}
                              index={index}
                              variant="history"
                              noButton
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-600">
                    {t('admin.noDetailsAvailable')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <BackgroundWrapper>
        <PageTransition>
          <div className="md:p-6">
            {/* <MyProfileBanner  /> */}
            {/* <br /> */}

            <section className={CARD_STYLES}>
              <div className="">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-semibold ">{t('admin.employees')}</h3>
                  <button
                    onClick={handleExportToExcel}
                    disabled={isExporting}
                    className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('admin.exporting')}
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {t('admin.exportToExcel')}
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">{t('admin.allBranches')}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id.toString()}>{b.name}</option>
                    ))}
                  </select>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">{t('admin.allPositions')}</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id.toString()}>{p.name}</option>
                    ))}
                  </select>
                  <select
                    value={testStatus}
                    onChange={(e) => setTestStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">{t('admin.allStatuses')}</option>
                    {(['refunded', 'passed', 'failed'] as const).map((s) => (
                      <option key={s} value={s}>{t(`status.${s}` as any)}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-4">
                  {usersQuery.isLoading ? (
                    <div className="bg-white rounded-2xl border border-[#E2E8F080] overflow-hidden">
                      <div className="flex items-center justify-center h-32">
                        <div className="flex flex-col items-center gap-3">
                          <div
                            className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-600 text-base">{t('loading.employees')}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <DataTable
                      data={users}
                      columns={columns}
                      itemsPerPage={10}
                      showPagination={true}
                      emptyMessage={t('admin.noEmployees')}
                    />
                  )}
                </div>
              </div>
            </section>
          </div>
        </PageTransition>
      </BackgroundWrapper>
      <ConfirmationModal
        isOpen={certificateModal.isOpen}
        onClose={cancelCertificateDownload}
        onConfirm={confirmCertificateDownload}
        title={t('certificate.downloadTitle')}
        message={t('certificate.downloadMessage', { userName: certificateModal.userName })}
        confirmText={t('certificate.download')}
        cancelText={t('certificate.cancel')}
      />
    </div>

  );
};

export default AdminEmployeesPage;



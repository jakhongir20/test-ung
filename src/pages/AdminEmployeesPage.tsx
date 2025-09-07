import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useModeratorUserDetails, useModeratorUsers } from '../api/moderator';
import { useI18n } from '../i18n';
import { MyProfileBanner } from "../components/MyProfileBanner.tsx";

type Employee = {
  id: number;
  name: string;
  branch: string;
  position: string;
  lastScore: number;
  attempts: number;
  status: 'Refunded' | 'Passed' | 'Failed';
};

const statusBadge: Record<string, string> = {
  Refunded: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Passed: 'bg-blue-50 text-blue-700 ring-blue-200',
  Failed: 'bg-rose-50 text-rose-700 ring-rose-200',
  'refunded': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'passed': 'bg-blue-50 text-blue-700 ring-blue-200',
  'failed': 'bg-rose-50 text-rose-700 ring-rose-200',
};

const AdminEmployeesPage: FC = () => {
  const {t} = useI18n();
  const [branch, setBranch] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [testStatus, setTestStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

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

  // Fetch selected user details
  const userDetailsQuery = useModeratorUserDetails(selectedUserId ?? undefined);
  const selectedUser = userDetailsQuery.data as any;

  // Extract unique branches and positions from the data
  const branches = useMemo(() => {
    const branchSet = new Set<string>();
    users.forEach((user: any) => {
      if (user.branch) branchSet.add(user.branch);
    });
    return Array.from(branchSet).sort();
  }, [users]);

  const positions = useMemo(() => {
    const positionSet = new Set<string>();
    users.forEach((user: any) => {
      if (user.position) positionSet.add(user.position);
    });
    return Array.from(positionSet).sort();
  }, [users]);

  // Pagination settings
  const itemsPerPage = 10;
  const totalItems = users.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  // Handle pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    goToPage(currentPage - 1);
  };

  const goToNextPage = () => {
    goToPage(currentPage + 1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Loading state
  if (usersQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-cyan-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-cyan-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('loading.employees')}</h2>
          <p className="text-gray-600">
            {t('loading.employeesDesc')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (usersQuery.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
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
    <div className="space-y-6">
      <MyProfileBanner/>

      <section className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold">{t('admin.employees')}</h3>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder={t('admin.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <select value={branch} onChange={(e) => setBranch(e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="">{t('admin.allBranches')}</option>
              {branches.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select value={position} onChange={(e) => setPosition(e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="">{t('admin.allPositions')}</option>
              {positions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={testStatus} onChange={(e) => setTestStatus(e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="">{t('admin.allStatuses')}</option>
              {(['Refunded', 'Passed', 'Failed'] as const).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-3 pr-4">{t('table.name')}</th>
                <th className="py-3 pr-4">{t('table.branch')}</th>
                <th className="py-3 pr-4">{t('table.position')}</th>
                <th className="py-3 pr-4">{t('table.lastScore')}</th>
                <th className="py-3 pr-4">{t('table.attempts')}</th>
                <th className="py-3 pr-4">{t('table.status')}</th>
                <th className="py-3 pr-4"/>
              </tr>
              </thead>
              <tbody>
              {currentUsers.map((user: any) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{user.name || t('admin.na')}</td>
                  <td className="py-3 pr-4">{user.branch || t('admin.na')}</td>
                  <td className="py-3 pr-4">{user.position || t('admin.na')}</td>
                  <td className="py-3 pr-4">{user.best_score || 0}</td>
                  <td className="py-3 pr-4">{user.total_attempts || 0}</td>
                  <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge[user.status] || 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
                        {user.status || t('admin.unknown')}
                      </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => setSelectedUserId(user.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-gray-200 hover:bg-gray-50"
                      aria-label={t('admin.aboutEmployee')}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                        <path
                          d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="rounded-lg ring-1 ring-gray-200 px-2.5 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.previous')}
            </button>

            {getPageNumbers().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => typeof pageNum === 'number' ? goToPage(pageNum) : null}
                disabled={typeof pageNum !== 'number'}
                className={`h-8 w-8 rounded-lg ring-1 ${typeof pageNum === 'number'
                  ? currentPage === pageNum
                    ? 'bg-cyan-600 text-white ring-cyan-600'
                    : 'ring-gray-200 hover:bg-gray-50'
                  : 'ring-gray-200 cursor-default'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="rounded-lg ring-1 ring-gray-200 px-2.5 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('admin.next')}
            </button>

            <div className="ml-auto">
              {t('admin.showingResults', {
                start: startIndex + 1,
                end: Math.min(endIndex, totalItems),
                total: totalItems
              })}
            </div>
          </div>
        </div>
      </section>

      {selectedUserId && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedUserId(null)}/>
          <div
            className="absolute right-4 top-4 bottom-4 w-[min(760px,95vw)] overflow-auto rounded-2xl bg-white ring-1 ring-gray-200 shadow-xl p-6">
            {userDetailsQuery.isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : userDetailsQuery.error ? (
              <div className="text-center text-red-600">
                {t('admin.errorLoadingDetails')}
              </div>
            ) : selectedUser ? (
              <>
                <div className="flex items-start justify-between">
                  <h4 className="text-lg font-semibold">{t('admin.aboutEmployee')}</h4>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusBadge[selectedUser.status] || 'bg-gray-50 text-gray-700 ring-gray-200'}`}>
                    {selectedUser.status || t('admin.unknown')}
                  </span>
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
                    <div className="font-medium">{selectedUser.position || t('admin.na')}</div>
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
                    <h5 className="text-sm font-semibold mb-3">{t('admin.totalStatistics')}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                        <div className="text-xs text-gray-500">{t('admin.totalAttempts')}</div>
                        <div className="text-2xl font-bold text-cyan-700">
                          {selectedUser.total_statistics.total_attempts || 0}
                        </div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                        <div className="text-xs text-gray-500">{t('admin.bestScore')}</div>
                        <div className="text-2xl font-bold text-cyan-700">
                          {selectedUser.total_statistics.best_score || 0}
                        </div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                        <div className="text-xs text-gray-500">{t('admin.completedTests')}</div>
                        <div className="text-2xl font-bold text-cyan-700">
                          {selectedUser.total_statistics.completed_surveys || 0}
                        </div>
                      </div>
                      <div className="rounded-xl ring-1 ring-gray-200 p-3 text-center">
                        <div className="text-xs text-gray-500">{t('admin.averageScore')}</div>
                        <div className="text-2xl font-bold text-cyan-700">
                          {selectedUser.total_statistics.average_score || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.survey_history && selectedUser.survey_history.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-sm font-semibold mb-3">{t('admin.testHistory')}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedUser.survey_history.map((survey: any, index: number) => (
                        <article key={index} className="rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white">
                          <div className="p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                            <div className="text-sm font-semibold">Test #{index + 1}</div>
                            <div className="text-xs text-cyan-100">
                              {survey.completed_at ? new Date(survey.completed_at).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="p-6 grid place-items-center">
                            <div className="text-xs text-gray-500">{t('admin.score')}</div>
                            <div className="text-5xl font-bold text-cyan-700">{survey.score || 0}</div>
                            <div className="text-xs text-gray-500">{t('admin.of')} {survey.total_questions || 30}</div>
                          </div>
                        </article>
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
      )}
    </div>
  );
};

export default AdminEmployeesPage;



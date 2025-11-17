import type { FC } from 'react';
import React, { useRef } from 'react';
import { Controller, useForm } from "react-hook-form";
import { useI18n } from "../i18n";
import { logout, useUpdateUserProfile } from "../api/auth";
import { useUsersMeRetrieve, usePositionsRetrieve, useGtfRetrieve } from "../api/generated/respondentWebAPI";
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsFormValues = {
  name: string;
  branch: string;
  position: string;
  employee_level: 'junior' | 'engineer';
  work_domain: 'natural_gas' | 'lpg_gas';
};

export const SettingsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t, lang } = useI18n();
  const { data: user } = useUsersMeRetrieve();
  const updateProfile = useUpdateUserProfile();

  useBodyScrollLock(isOpen);

  // Fetch positions and GTF from API
  const { data: positionsData, isLoading: positionsLoading, error: positionsError } = usePositionsRetrieve();
  const { data: gtfData } = useGtfRetrieve();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
    trigger
  } = useForm<SettingsFormValues>({
    defaultValues: {
      name: user?.name || '',
      branch: user?.branch || '',
      position: user?.position || '',
      employee_level: ((user as any)?.employee_level as 'junior' | 'engineer') || 'junior',
      work_domain: ((user as any)?.work_domain as 'natural_gas' | 'lpg_gas') || 'natural_gas'
    },
  });

  const prevLangRef = useRef(lang);

  // Helper function to get localized name
  const getLocalizedName = (item: any) => {
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
  };

  // Helper function to get localized position label with branch
  const getLocalizedPositionLabel = (position: any) => {
    const positionName = getLocalizedName(position);
    const branchName = position?.branch ? getLocalizedName(position.branch) : '';
    return branchName ? `${positionName} - ${branchName}` : positionName;
  };

  // Reset form when user data changes
  React.useEffect(() => {
    if (user && positionsData && gtfData) {
      // Find the correct position and branch IDs based on user data
      const userPosition = positionsData.positions?.find((pos: any) =>
        pos.name_uz === user.position ||
        pos.name_uz_cyrl === user.position ||
        pos.name_ru === user.position
      );

      const userBranch = gtfData.gtf?.find((b: any) =>
        b.name_uz === user.branch ||
        b.name_uz_cyrl === user.branch ||
        b.name_ru === user.branch
      );

      reset({
        name: user.name || '',
        branch: userBranch?.id?.toString() || user.branch || '',
        position: userPosition?.id?.toString() || user.position || '',
        employee_level: ((user as any).employee_level as 'junior' | 'engineer') || 'junior',
        work_domain: ((user as any).work_domain as 'natural_gas' | 'lpg_gas') || 'natural_gas'
      });
    }
  }, [user, reset, positionsData, gtfData]);

  // Update validation messages when language changes
  React.useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (prevLangRef.current !== lang && hasErrors) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors();
      trigger();
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      clearErrors();

      // Find the actual names for the selected IDs
      const selectedPosition = positionsData?.positions?.find((pos: any) => pos.id.toString() === data.position);
      const selectedBranch = gtfData?.gtf?.find((b: any) => b.id.toString() === data.branch);

      await updateProfile.mutateAsync({
        name: data.name.trim(),
        branch: selectedBranch ? getLocalizedName(selectedBranch) : data.branch.trim(),
        position: selectedPosition ? getLocalizedName(selectedPosition) : data.position.trim()
      });

      // Show success message (you could add a toast notification here)

      // Close modal on success
      onClose();
    } catch (error: any) {

      // Handle API errors
      if (error?.response?.data?.name) {
        setError('name', {
          type: 'manual',
          message: error.response.data.name[0] || t('settings.fullNameRequired')
        });
      }
      if (error?.response?.data?.branch) {
        setError('branch', {
          type: 'manual',
          message: error.response.data.branch[0] || t('settings.branchRequired')
        });
      }
      if (error?.response?.data?.position) {
        setError('position', {
          type: 'manual',
          message: error.response.data.position[0] || t('settings.positionRequired')
        });
      }
      if (error?.response?.data?.employee_level) {
        setError('employee_level', {
          type: 'manual',
          message: error.response.data.employee_level[0] || t('settings.employeeLevelRequired')
        });
      }
      if (error?.response?.data?.work_domain) {
        setError('work_domain', {
          type: 'manual',
          message: error.response.data.work_domain[0] || t('settings.workDomainRequired')
        });
      }

      // General error if no specific field errors
      if (!error?.response?.data?.name && !error?.response?.data?.branch && !error?.response?.data?.position && !error?.response?.data?.employee_level && !error?.response?.data?.work_domain) {
        setError('root', {
          type: 'manual',
          message: t('settings.saveError')
        });
      }
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  // Show error if API calls failed
  if (positionsError) {
    return (
      <div className="fixed inset-0 h-screen w-full top-0 bottom-0 left-0 right-0 z-20">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />
        <div className="absolute right-4 top-4 bottom-4 w-[min(450px,95vw)] overflow-hidden rounded-xl md:rounded-[16px] bg-white ring-1 ring-gray-200 shadow-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between px-6 py-6">
              <h4 className="text-xl font-semibold">{t('settings.title')}</h4>
              <button
                onClick={onClose}
                className="inline-flex h-6 w-6 items-center justify-center rounded ring-1 ring-gray-200 hover:bg-gray-50"
                aria-label={t('close')}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="flex-1 px-6 pb-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-600 text-base mb-4">
                  {t('error.connectionDesc')}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                >
                  {t('retry')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen w-full top-0 bottom-0 left-0 right-0 z-20 ">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div
        className="absolute right-4 top-4 bottom-4 w-[min(450px,95vw)] overflow-hidden rounded-xl md:rounded-[16px] bg-white ring-1 ring-gray-200 shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-6">
            <h4 className="text-xl font-semibold">{t('settings.title')}</h4>
            <button
              onClick={onClose}
              className="inline-flex h-6 w-6 items-center justify-center rounded ring-1 ring-gray-200 hover:bg-gray-50"
              aria-label={t('close')}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              {/* Full Name Field */}
              <div>
                <div className="text-base text-gray-500 mb-2">{t('settings.fullName')}</div>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: t('settings.fullNameRequired') }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      disabled
                      placeholder={t('settings.fullNamePlaceholder')}
                      className={`w-full px-4 py-3 border border-gray-300 bg-gray-100 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Branch Field (temporarily hidden) */}
              {false && (<div>
                <div className="text-base text-gray-500 mb-2">{t('settings.branch')}</div>
                <Controller
                  name="branch"
                  control={control}
                  rules={{ required: t('settings.branchRequired') }}
                  render={({ field }) => (
                    <select
                      {...field}
                      disabled={false}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.branch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">{t('settings.selectBranch')}</option>
                      {gtfData?.gtf?.map((b) => (
                        <option key={b.id} value={b.id}>
                          {getLocalizedName(b)}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors?.branch && (
                  <p className="text-red-600 text-xs mt-1">{errors.branch?.message as string}</p>
                )}
              </div>)}

              {/* Position Field */}
              <div>
                <div className="text-base text-gray-500 mb-2">{t('settings.position')}</div>
                <Controller
                  name="position"
                  control={control}
                  rules={{ required: t('settings.positionRequired') }}
                  render={({ field }) => (
                    <select
                      {...field}
                      disabled={positionsLoading}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">{t('settings.selectPosition')}</option>
                      {positionsData?.positions?.map((position) => (
                        <option key={position.id} value={position.id}>
                          {getLocalizedPositionLabel(position)}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.position && (
                  <p className="text-red-600 text-xs mt-1">{errors.position.message}</p>
                )}
              </div>

              {/* Employee Level Field */}
              {/*<div>*/}
              {/*  <div className="text-base text-gray-500 mb-2">{t('settings.employeeLevel')}</div>*/}
              {/*  <Controller*/}
              {/*    name="employee_level"*/}
              {/*    control={control}*/}
              {/*    rules={{ required: t('settings.employeeLevelRequired') }}*/}
              {/*    render={({ field }) => (*/}
              {/*      <select*/}
              {/*        {...field}*/}
              {/*        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.employee_level ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}*/}
              {/*      >*/}
              {/*        <option value="junior">Junior</option>*/}
              {/*        <option value="engineer">Engineer</option>*/}
              {/*      </select>*/}
              {/*    )}*/}
              {/*  />*/}
              {/*  {errors.employee_level && (*/}
              {/*    <p className="text-red-600 text-xs mt-1">{errors.employee_level.message}</p>*/}
              {/*  )}*/}
              {/*</div>*/}

              {/* Work Domain Field */}
              {/*<div>*/}
              {/*  <div className="text-base text-gray-500 mb-2">{t('settings.workDomain')}</div>*/}
              {/*  <Controller*/}
              {/*    name="work_domain"*/}
              {/*    control={control}*/}
              {/*    rules={{ required: t('settings.workDomainRequired') }}*/}
              {/*    render={({ field }) => (*/}
              {/*      <select*/}
              {/*        {...field}*/}
              {/*        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.work_domain ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}*/}
              {/*      >*/}
              {/*        <option value="natural_gas">Natural Gas</option>*/}
              {/*        <option value="lpg_gas">LPG Gas</option>*/}
              {/*      </select>*/}
              {/*    )}*/}
              {/*  />*/}
              {/*  {errors.work_domain && (*/}
              {/*    <p className="text-red-600 text-xs mt-1">{errors.work_domain.message}</p>*/}
              {/*  )}*/}
              {/*</div>*/}

              {/* General Error */}
              {errors.root && (
                <div className="text-center">
                  <p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-4">
                    {errors.root.message}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-6">
            <div className="flex md:flex-row flex-col md:gap-0 gap-2  md:space-x-4">
              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center flex-1 px-4 py-3 text-base font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('settings.logout')}
              </button>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting || positionsLoading}
                className="flex items-center md:order-1 -order-1 justify-center flex-1 px-4 py-3 text-base font-medium text-white bg-[#00A2DE] border border-transparent rounded-lg hover:bg-[#0088C7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {t('settings.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

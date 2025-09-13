import type { FC } from 'react';
import React from 'react';
import { Controller, useForm } from "react-hook-form";
import { useI18n } from "../i18n";
import { logout, useUpdateUserProfile } from "../api/auth";
import { useUsersMeRetrieve } from "../api/generated/respondentWebAPI";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsFormValues = {
  name: string;
  branch: string;
  position: string;
};

export const SettingsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  const { data: user } = useUsersMeRetrieve();
  const updateProfile = useUpdateUserProfile();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset
  } = useForm<SettingsFormValues>({
    defaultValues: {
      name: user?.name || '',
      branch: user?.branch || '',
      position: user?.position || ''
    },
  });

  // Reset form when user data changes
  React.useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        branch: user.branch || '',
        position: user.position || ''
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      clearErrors();

      await updateProfile.mutateAsync({
        name: data.name.trim(),
        branch: data.branch.trim(),
        position: data.position.trim()
      });

      // Show success message (you could add a toast notification here)
      console.log(t('settings.saveSuccess'));

      // Close modal on success
      onClose();
    } catch (error: any) {
      console.error('Error updating profile:', error);

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

      // General error if no specific field errors
      if (!error?.response?.data?.name && !error?.response?.data?.branch && !error?.response?.data?.position) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen w-full top-0 bottom-0 left-0 right-0 z-30">
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
              <div className="rounded-xl ring-1 ring-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-2">{t('settings.fullName')}</div>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: t('settings.fullNameRequired') }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder={t('settings.fullNamePlaceholder')}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Branch Field */}
              <div className="rounded-xl ring-1 ring-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-2">{t('settings.branch')}</div>
                <Controller
                  name="branch"
                  control={control}
                  rules={{ required: t('settings.branchRequired') }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.branch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">{t('settings.branchPlaceholder')}</option>
                      <option value="tashkent">{t('region.tashkent')}</option>
                      <option value="samarkand">{t('region.samarkand')}</option>
                      <option value="bukhara">{t('region.bukhara')}</option>
                      <option value="namangan">{t('region.namangan')}</option>
                      <option value="andijan">{t('region.andijan')}</option>
                      <option value="fergana">{t('region.fergana')}</option>
                      <option value="kashkadarya">{t('region.kashkadarya')}</option>
                      <option value="surkhandarya">{t('region.surkhandarya')}</option>
                      <option value="khorezm">{t('region.khorezm')}</option>
                      <option value="karakalpakstan">{t('region.karakalpakstan')}</option>
                      <option value="jizzakh">{t('region.jizzakh')}</option>
                      <option value="sirdarya">{t('region.sirdarya')}</option>
                    </select>
                  )}
                />
                {errors.branch && (
                  <p className="text-red-600 text-xs mt-1">{errors.branch.message}</p>
                )}
              </div>

              {/* Position Field */}
              <div className="rounded-xl ring-1 ring-gray-200 p-4">
                <div className="text-sm text-gray-500 mb-2">{t('settings.position')}</div>
                <Controller
                  name="position"
                  control={control}
                  rules={{ required: t('settings.positionRequired') }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-[#00A2DE] bg-white ${errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    >
                      <option value="">{t('settings.positionPlaceholder')}</option>
                      <option value="manager">{t('position.manager')}</option>
                      <option value="engineer">{t('position.engineer')}</option>
                      <option value="technician">{t('position.technician')}</option>
                      <option value="supervisor">{t('position.supervisor')}</option>
                      <option value="operator">{t('position.operator')}</option>
                      <option value="specialist">{t('position.specialist')}</option>
                      <option value="analyst">{t('position.analyst')}</option>
                    </select>
                  )}
                />
                {errors.position && (
                  <p className="text-red-600 text-xs mt-1">{errors.position.message}</p>
                )}
              </div>

              {/* General Error */}
              {errors.root && (
                <div className="text-center">
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-4">
                    {errors.root.message}
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-6">
            <div className="flex space-x-4">
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
                disabled={isSubmitting}
                className="flex items-center justify-center flex-1 px-4 py-3 text-base font-medium text-white bg-[#00A2DE] border border-transparent rounded-lg hover:bg-[#0088C7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

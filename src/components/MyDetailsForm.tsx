import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useI18n } from '../i18n';
import { useUsersPartialUpdate } from '../api/generated/respondentWebAPI';
import { useAuthStore } from '../stores/authStore';
import { handleAuthError } from '../api/auth';

interface ProfileFormData {
  name: string;
  branch: string;
  position: string;
}

export const MyDetailsForm: FC = () => {
  const { t } = useI18n();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateUserMutation = useUsersPartialUpdate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: '',
      branch: '',
      position: ''
    }
  });

  // Set initial values from user data
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('branch', user.branch || '');
      setValue('position', user.position || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    try {
      const response = await updateUserMutation.mutateAsync({
        id: user.id,
        data: {
          name: data.name,
          branch: data.branch,
          position: data.position
        }
      });

      // Update user in store
      setUser(response);

      // Show success message
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);

    } catch (error) {
      console.error('Profile update error:', error);
      if (handleAuthError(error)) {
        return;
      }
      // Handle other errors here if needed
    }
  };

  return (
    <section className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 md:p-6">
      <h3 className="text-lg font-semibold text-[#1E293B] mb-4 md:mb-6">
        {t('profile.myDetails')}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FIO Field */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              {t('profile.fio')}
            </label>
            <input
              {...register('name', { required: true })}
              type="text"
              placeholder={t('profile.fio')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A2DE] focus:border-transparent transition-colors duration-200"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">This field is required</p>
            )}
          </div>

          {/* Branch Field */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              {t('profile.branch')}
            </label>
            <div className="relative">
              <input
                {...register('branch')}
                type="text"
                placeholder={t('profile.branch')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A2DE] focus:border-transparent transition-colors duration-200"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Position Field */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              {t('profile.position')}
            </label>
            <input
              {...register('position')}
              type="text"
              placeholder={t('profile.position')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A2DE] focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${isSubmitting
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-[#00A2DE] text-white hover:bg-[#0088CC]'
              }`}
          >
            {isSubmitting ? 'Saving...' : t('profile.save')}
          </button>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{t('profile.saveSuccess')}</p>
          </div>
        )}

        {/* Error Message */}
        {updateUserMutation.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{t('profile.saveError')}</p>
          </div>
        )}
      </form>
    </section>
  );
};

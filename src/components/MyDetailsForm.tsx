import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useI18n } from '../i18n';
import { useUsersPartialUpdate } from '../api/generated/respondentWebAPI';
import { useAuthStore } from '../stores/authStore';
import { handleAuthError } from '../api/auth';

interface ProfileFormData {
  name: string;
}

export const MyDetailsForm: FC = () => {
  const {t} = useI18n();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateUserMutation = useUsersPartialUpdate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: {errors, isSubmitting}
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: ''
    }
  });

  // Set initial values from user data
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.id) return;

    try {
      const response = await updateUserMutation.mutateAsync({
        id: user.id,
        data: {
          name: data.name
        }
      });

      // Update user in store
      setUser(response);

      // Show success message
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);

    } catch (error) {

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
            <label className="block text-base font-medium text-[#374151] mb-2">
              {t('profile.fio')}
            </label>
            <input
              {...register('name', {required: true})}
              type="text"
              placeholder={t('profile.fio')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A2DE] focus:border-transparent transition-colors duration-200"
            />
            {errors.name && (
              <p className="mt-1 text-base text-red-600">This field is required</p>
            )}
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

        {isSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-base text-green-800">{t('profile.saveSuccess')}</p>
          </div>
        )}

        {/* Error Message */}
        {updateUserMutation.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-base text-red-800">{t('profile.saveError')}</p>
          </div>
        )}
      </form>
    </section>
  );
};

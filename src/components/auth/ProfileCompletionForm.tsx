import type { FC } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useUpdateUserProfile } from "../../api/auth.ts";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";

interface Props {
  className?: string;
}

type ProfileFormValues = {
  name: string;
  branch: string;
  position: string;
};

export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-sm !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';

export const ProfileCompletionForm: FC<Props> = () => {
  const navigate = useNavigate();
  const updateProfile = useUpdateUserProfile();
  const { t } = useI18n();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      branch: '',
      position: ''
    },
    mode: 'onSubmit'
  });

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // Clear any previous errors
      clearErrors();

      await updateProfile.mutateAsync({
        name: values.name.trim(),
        branch: values.branch.trim(),
        position: values.position.trim()
      });

      // Redirect to additional info page on success
      navigate('/additional-info', { replace: true });
    } catch (error: any) {
      // Handle API errors
      if (error?.response?.data?.name) {
        setError('name', {
          type: 'manual',
          message: error.response.data.name[0] || t('profileCompletion.nameRequired')
        });
      }
      if (error?.response?.data?.branch) {
        setError('branch', {
          type: 'manual',
          message: error.response.data.branch[0] || t('profileCompletion.branchRequired')
        });
      }
      if (error?.response?.data?.position) {
        setError('position', {
          type: 'manual',
          message: error.response.data.position[0] || t('profileCompletion.positionRequired')
        });
      }

      // General error if no specific field errors
      if (!error?.response?.data?.name && !error?.response?.data?.branch && !error?.response?.data?.position) {
        setError('root', {
          type: 'manual',
          message: t('profileCompletion.saveError')
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name Field */}
      <div className="space-y-2">
        <label className="block text-sm text-black font-medium">
          {t('profileCompletion.name')} *
        </label>
        <input
          {...control.register('name', {
            required: t('profileCompletion.nameRequired'),
            minLength: {
              value: 2,
              message: t('profileCompletion.nameRequired')
            }
          })}
          type="text"
          placeholder={t('profileCompletion.namePlaceholder')}
          className={`${authInputStyle} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          onChange={(e) => {
            control.register('name').onChange(e);
            if (errors.name) clearErrors('name');
          }}
        />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      {/* Branch Field */}
      <div className="space-y-2">
        <label className="block text-sm text-black font-medium">
          {t('profileCompletion.branch')} *
        </label>
        <input
          {...control.register('branch', {
            required: t('profileCompletion.branchRequired'),
            minLength: {
              value: 2,
              message: t('profileCompletion.branchRequired')
            }
          })}
          type="text"
          placeholder={t('profileCompletion.branchPlaceholder')}
          className={`${authInputStyle} ${errors.branch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          onChange={(e) => {
            control.register('branch').onChange(e);
            if (errors.branch) clearErrors('branch');
          }}
        />
        {errors.branch && (
          <p className="text-red-600 text-sm">{errors.branch.message}</p>
        )}
      </div>

      {/* Position Field */}
      <div className="space-y-2">
        <label className="block text-sm text-black font-medium">
          {t('profileCompletion.position')} *
        </label>
        <input
          {...control.register('position', {
            required: t('profileCompletion.positionRequired'),
            minLength: {
              value: 2,
              message: t('profileCompletion.positionRequired')
            }
          })}
          type="text"
          placeholder={t('profileCompletion.positionPlaceholder')}
          className={`${authInputStyle} ${errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          onChange={(e) => {
            control.register('position').onChange(e);
            if (errors.position) clearErrors('position');
          }}
        />
        {errors.position && (
          <p className="text-red-600 text-sm">{errors.position.message}</p>
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

      <FormButton
        isLoading={isSubmitting}
        title={t('profileCompletion.save')}
      />
    </form>
  );
};


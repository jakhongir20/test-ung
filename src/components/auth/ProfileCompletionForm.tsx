import type { FC } from 'react';
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
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
  employee_level: 'junior' | 'engineer';
  work_domain: 'natural_gas' | 'lpg_gas';
};

export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-sm !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';

export const ProfileCompletionForm: FC<Props> = () => {
  const navigate = useNavigate();
  const updateProfile = useUpdateUserProfile();
  const {t, lang} = useI18n();

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting},
    setError,
    clearErrors,
    trigger
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      branch: '',
      position: '',
      employee_level: 'junior',
      work_domain: 'natural_gas'
    },
    mode: 'onSubmit'
  });

  const prevLangRef = useRef(lang);

  // Update validation messages when language changes
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (prevLangRef.current !== lang && hasErrors) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors();
      trigger();
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // Clear any previous errors
      clearErrors();

      await updateProfile.mutateAsync({
        name: values.name.trim(),
        branch: values.branch.trim(),
        position: values.position.trim(),
        employee_level: values.employee_level,
        work_domain: values.work_domain
      });

      // Redirect to main page on success
      navigate('/', {replace: true});
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
      if (error?.response?.data?.employee_level) {
        setError('employee_level', {
          type: 'manual',
          message: error.response.data.employee_level[0] || t('profileCompletion.employeeLevelRequired')
        });
      }
      if (error?.response?.data?.work_domain) {
        setError('work_domain', {
          type: 'manual',
          message: error.response.data.work_domain[0] || t('profileCompletion.workDomainRequired')
        });
      }

      // General error if no specific field errors
      if (!error?.response?.data?.name && !error?.response?.data?.branch && !error?.response?.data?.position && !error?.response?.data?.employee_level && !error?.response?.data?.work_domain) {
        setError('root', {
          type: 'manual',
          message: t('profileCompletion.saveError')
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name Field */}
      <div>
        <label className="block text-sm text-black font-medium mb-1.5">
          {t('profileCompletion.name')} *
        </label>
        <Controller
          name="name"
          control={control}
          rules={{
            required: t('profileCompletion.nameRequired'),
            minLength: {
              value: 2,
              message: t('profileCompletion.nameRequired')
            }
          }}
          render={({field}) => (
            <input
              {...field}
              type="text"
              placeholder={t('profileCompletion.namePlaceholder')}
              className={`${authInputStyle} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
          )}
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Branch Field */}
      <div>
        <label className="block text-sm text-black font-medium mb-1.5">
          {t('profileCompletion.branch')} *
        </label>
        <Controller
          name="branch"
          control={control}
          rules={{
            required: t('profileCompletion.branchRequired'),
            minLength: {
              value: 2,
              message: t('profileCompletion.branchRequired')
            }
          }}
          render={({field}) => (
            <input
              {...field}
              type="text"
              placeholder={t('profileCompletion.branchPlaceholder')}
              className={`${authInputStyle} ${errors.branch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
          )}
        />
        {errors.branch && (
          <p className="text-red-600 text-sm mt-1">{errors.branch.message}</p>
        )}
      </div>

      {/* Position Field */}
      <div>
        <label className="block text-sm text-black font-medium mb-1.5">
          {t('profileCompletion.position')} *
        </label>
        <Controller
          name="position"
          control={control}
          rules={{
            required: t('profileCompletion.positionRequired'),
            minLength: {
              value: 2,
              message: t('profileCompletion.positionRequired')
            }
          }}
          render={({field}) => (
            <input
              {...field}
              type="text"
              placeholder={t('profileCompletion.positionPlaceholder')}
              className={`${authInputStyle} ${errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
          )}
        />
        {errors.position && (
          <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
        )}
      </div>

      {/* Employee Level Field */}
      <div>
        <label className="block text-sm text-black font-medium mb-1.5">
          {t('settings.employeeLevel')} *
        </label>
        <Controller
          name="employee_level"
          control={control}
          rules={{required: t('profileCompletion.employeeLevelRequired')}}
          render={({field}) => (
            <select
              {...field}
              className={`${authInputStyle} ${errors.employee_level ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="junior">Junior</option>
              <option value="engineer">Engineer</option>
            </select>
          )}
        />
        {errors.employee_level && (
          <p className="text-red-600 text-sm mt-1">{errors.employee_level.message}</p>
        )}
      </div>

      {/* Work Domain Field */}
      <div>
        <label className="block text-sm text-black font-medium mb-1.5">
          {t('settings.workDomain')} *
        </label>
        <Controller
          name="work_domain"
          control={control}
          rules={{required: t('profileCompletion.workDomainRequired')}}
          render={({field}) => (
            <select
              {...field}
              className={`${authInputStyle} ${errors.work_domain ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            >
              <option value="natural_gas">Natural Gas</option>
              <option value="lpg_gas">LPG Gas</option>
            </select>
          )}
        />
        {errors.work_domain && (
          <p className="text-red-600 text-sm mt-1">{errors.work_domain.message}</p>
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

      <div className="mt-8">
        <FormButton
          isLoading={isSubmitting}
          title={t('profileCompletion.save')}
        />
      </div>
    </form>
  );
};


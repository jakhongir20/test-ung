import type { FC } from 'react';
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../api/auth.ts";
import { usePositionsRetrieve, useBranchesRetrieve, useGtfRetrieve } from "../../api/generated/respondentWebAPI";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";

interface Props {
  className?: string;
}

type RegisterFormValues = {
  login: string;
  password: string;
  confirmPassword: string;
  name: string;
  position_id: number;
  gtf_id: number;
  branch_id: number;
};


export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';

export const RegisterForm: FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const register = useRegister();
  const { t, lang } = useI18n();

  // Fetch positions, branches, and GTF from API
  const { data: positionsData, isLoading: positionsLoading, error: positionsError } = usePositionsRetrieve();
  const { data: branchesData, isLoading: branchesLoading, error: branchesError } = useBranchesRetrieve();
  const { data: gtfData, isLoading: gtfLoading, error: gtfError } = useGtfRetrieve();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    trigger,
    watch,
    setValue
  } = useForm<RegisterFormValues>({
    defaultValues: {
      login: '',
      password: '',
      confirmPassword: '',
      name: '',
      position_id: 0,
      gtf_id: 0,
      branch_id: 0
    },
  });

  const prevLangRef = useRef(lang);
  const password = watch('password');
  const branchId = watch('branch_id');

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

  // Filter positions based on selected branch (include global positions with no branch)
  const filteredPositions = positionsData?.positions?.filter((position: any) => {
    if (!branchId || branchId === 0) return true;
    const posBranchId = position?.branch?.id;
    return posBranchId === branchId || posBranchId == null;
  }) || [];

  // Show error if API calls failed
  if (positionsError || branchesError || gtfError) {
    return (
      <div className="text-center py-8">
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
    );
  }

  // Update validation messages when language changes
  useEffect(() => {
    if (prevLangRef.current !== lang && Object.keys(errors).length > 0) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors();
      trigger();
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors]);

  // Reset position when branch changes
  useEffect(() => {
    setValue('position_id', 0);
  }, [branchId, setValue]);

  // Create reactive validation rules
  const loginValidationRules = {
    required: t('auth.fieldRequired'),
    minLength: {
      value: 1,
      message: t('auth.loginMinLength')
    }
  };

  const passwordValidationRules = {
    required: t('auth.fieldRequired'),
    minLength: {
      value: 1, // TODO: change to 6
      message: t('auth.passwordMinLength')
    }
  };

  const confirmPasswordValidationRules = {
    required: t('auth.fieldRequired'),
    validate: (val: string) => val === password || t('auth.passwordsDoNotMatch')
  };

  const nameValidationRules = {
    required: t('auth.fieldRequired'),
    minLength: {
      value: 2,
      message: t('auth.nameMinLength')
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register.mutateAsync({
        phone: values.login,
        password: values.password,
        name: values.name,
        position_id: values.position_id,
        gtf_id: values.gtf_id
      });
      navigate('/', { replace: true });
    } catch (error: any) {
      // Handle registration errors

      // Show server error message
      if (error?.response?.data?.non_field_errors) {
        alert(error.response.data.non_field_errors[0]);
      } else if (error?.response?.data?.detail) {
        alert(error.response.data.detail);
      } else if (error?.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error?.response?.data?.phone_number) {
        alert(error.response.data.phone_number[0]);
      } else {
        alert(t('auth.registerError'));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.login')}</label>
        <Controller
          name="login"
          control={control}
          rules={loginValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('auth.loginPlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.login && <p className="text-red-600 text-base mt-1">{errors.login.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.fullName')}</label>
        <Controller
          name="name"
          control={control}
          rules={nameValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              placeholder={t('auth.fullNamePlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.name && <p className="text-red-600 text-base mt-1">{errors.name.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.password')}</label>
        <Controller
          name="password"
          control={control}
          rules={passwordValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.password && <p className="text-red-600 text-base mt-1">{errors.password.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.confirmPassword')}</label>
        <Controller
          name="confirmPassword"
          control={control}
          rules={confirmPasswordValidationRules}
          render={({ field }) => (
            <input
              {...field}
              type="password"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              className={authInputStyle}
            />
          )}
        />
        {errors.confirmPassword && <p className="text-red-600 text-base mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.branch')}</label>
        <Controller
          name="branch_id"
          control={control}
          rules={{ required: t('auth.fieldRequired'), validate: (v: number) => v !== 0 || t('auth.fieldRequired') }}
          render={({ field }) => (
            <select {...field} className={authInputStyle} disabled={branchesLoading}>
              <option value={0}>{t('auth.selectBranch')}</option>
              {branchesData?.branches?.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {getLocalizedName(branch)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.branch_id && <p className="text-red-600 text-base mt-1">{errors.branch_id.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.position')}</label>
        <Controller
          name="position_id"
          control={control}
          rules={{ required: t('auth.fieldRequired'), validate: (v: number) => v !== 0 || t('auth.fieldRequired') }}
          render={({ field }) => (
            <select {...field} className={authInputStyle} disabled={positionsLoading || !branchId || branchId === 0}>
              <option value={0}>{t('auth.selectPosition')}</option>
              {filteredPositions.map((position) => (
                <option key={position.id} value={position.id}>
                  {getLocalizedName(position)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.position_id && <p className="text-red-600 text-base mt-1">{errors.position_id.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.branch')}</label>
        <Controller
          name="gtf_id"
          control={control}
          rules={{ required: t('auth.fieldRequired'), validate: (v: number) => v !== 0 || t('auth.fieldRequired') }}
          render={({ field }) => (
            <select {...field} className={authInputStyle} disabled={gtfLoading}>
              <option value={0}>{t('auth.selectBranch')}</option>
              {gtfData?.gtf?.map((gtf) => (
                <option key={gtf.id} value={gtf.id}>
                  {getLocalizedName(gtf)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.gtf_id && <p className="text-red-600 text-base mt-1">{errors.gtf_id.message}</p>}
      </div>

      <FormButton isLoading={isSubmitting || positionsLoading || branchesLoading || gtfLoading} title={t('auth.register')} />

      <div className="text-center mt-4">
        <p className="text-gray-600 text-base">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-cyan-700 hover:underline font-medium">
            {t('auth.login')}
          </Link>
        </p>
      </div>
    </form>
  );
};

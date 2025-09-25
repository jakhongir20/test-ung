import type { FC } from 'react';
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { MaskedInput } from "antd-mask-input";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../api/auth.ts";
import { usePositionsList, useBranchesList } from "../../api/generated/respondentWebAPI";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";

interface Props {
  className?: string;
}

type RegisterFormValues = {
  phone: string;
  password: string;
  confirmPassword: string;
  name: string;
  position_id: number;
  gtf_id: number;
};

const uzPhoneValidate = (val: string, t: (key: string) => string) => {
  const onlyDigits = (val || '').replace(/\D/g, '');
  return onlyDigits.length === 12 && onlyDigits.startsWith('998') || t('auth.invalidPhone');
};

export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';

export const RegisterForm: FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const register = useRegister();
  const { t, lang } = useI18n();

  // Fetch positions and branches from API
  const { data: positionsData, isLoading: positionsLoading, error: positionsError } = usePositionsList();
  const { data: branchesData, isLoading: branchesLoading, error: branchesError } = useBranchesList();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    trigger,
    watch
  } = useForm<RegisterFormValues>({
    defaultValues: {
      phone: '',
      password: '',
      confirmPassword: '',
      name: '',
      position_id: 0,
      gtf_id: 0
    },
  });

  const prevLangRef = useRef(lang);
  const password = watch('password');

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

  // Show error if API calls failed
  if (positionsError || branchesError) {
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

  // Create reactive validation rules
  const phoneValidationRules = {
    required: t('auth.fieldRequired'),
    validate: (val: string) => uzPhoneValidate(val, t)
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
        phone: values.phone.replace(/\s/g, ''),
        password: values.password,
        name: values.name,
        position_id: values.position_id,
        gtf_id: values.gtf_id
      });
      navigate('/', { replace: true });
    } catch (error: any) {
      // Handle registration errors
      if (error?.response?.data?.phone_number) {
        console.error('Phone number already exists');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.phoneNumber')}</label>
        <Controller
          name="phone"
          control={control}
          rules={phoneValidationRules}
          render={({ field }) => (
            <MaskedInput
              {...field}
              mask="+998 00 000 00 00"
              placeholder={t('auth.phonePlaceholder')}
              size="large"
              className={authInputStyle}
            />
          )}
        />
        {errors.phone && <p className="text-red-600 text-base mt-1">{errors.phone.message}</p>}
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
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.position')}</label>
        <Controller
          name="position_id"
          control={control}
          rules={{ required: t('auth.fieldRequired') }}
          render={({ field }) => (
            <select {...field} className={authInputStyle} disabled={positionsLoading}>
              <option value={0}>{t('auth.selectPosition')}</option>
              {positionsData?.positions?.map((position) => (
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
          rules={{ required: t('auth.fieldRequired') }}
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
        {errors.gtf_id && <p className="text-red-600 text-base mt-1">{errors.gtf_id.message}</p>}
      </div>

      <FormButton isLoading={isSubmitting || positionsLoading || branchesLoading} title={t('auth.register')} />

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

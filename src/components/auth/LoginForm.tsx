import type { FC } from 'react';
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { MaskedInput } from "antd-mask-input";
import { Link, useNavigate } from "react-router-dom";
import { usePasswordLogin } from "../../api/auth.ts";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";

interface Props {
  className?: string;
}


type LoginFormValues = { phone: string; password: string; };

const uzPhoneValidate = (val: string, t: (key: string) => string) => {
  const onlyDigits = (val || '').replace(/\D/g, '');
  return onlyDigits.length === 12 && onlyDigits.startsWith('998') || t('auth.invalidPhone');
};

export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';


export const LoginForm: FC<Props> = ({}) => {
  const navigate = useNavigate();
  const passwordLogin = usePasswordLogin();
  const {t, lang} = useI18n();
  const {control, handleSubmit, formState: {errors, isSubmitting}, clearErrors, trigger} = useForm<LoginFormValues>({
    defaultValues: {phone: '', password: ''},
  });

  const prevLangRef = useRef(lang);

  // Update validation messages when language changes
  useEffect(() => {
    if (prevLangRef.current !== lang && (errors.phone || errors.password)) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors(['phone', 'password']);
      trigger(['phone', 'password']);
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors.phone, errors.password]);

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

  const onSubmit = async ({phone, password}: LoginFormValues) => {
    try {
      await passwordLogin.mutateAsync({
        phone: phone.replace(/\s/g, ''),
        password
      });
      navigate('/', {replace: true});
    } catch (error: any) {
      // Handle login errors
      if (error?.response?.data?.non_field_errors?.includes('Invalid credentials')) {
        // You can set a general error here if needed
        console.error('Invalid credentials');
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
          render={({field}) => (
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
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.password')}</label>
        <Controller
          name="password"
          control={control}
          rules={passwordValidationRules}
          render={({field}) => (
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

      <FormButton isLoading={isSubmitting} title={t('auth.login')}/>

      <div className="text-center mt-4">
        <p className="text-gray-600 text-base">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-cyan-700 hover:underline font-medium">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </form>
  );
};

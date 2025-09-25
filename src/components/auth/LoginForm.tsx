import type { FC } from 'react';
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { usePasswordLogin } from "../../api/auth.ts";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";

interface Props {
  className?: string;
}


type LoginFormValues = { login: string; password: string; };


export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';


export const LoginForm: FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const passwordLogin = usePasswordLogin();
  const { t, lang } = useI18n();
  const { control, handleSubmit, formState: { errors, isSubmitting }, clearErrors, trigger } = useForm<LoginFormValues>({
    defaultValues: { login: '', password: '' },
  });

  const prevLangRef = useRef(lang);

  // Update validation messages when language changes
  useEffect(() => {
    if (prevLangRef.current !== lang && (errors.login || errors.password)) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors(['login', 'password']);
      trigger(['login', 'password']);
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors.login, errors.password]);

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

  const onSubmit = async ({ login, password }: LoginFormValues) => {
    try {
      await passwordLogin.mutateAsync({
        phone: login,
        password
      });
      navigate('/', { replace: true });
    } catch (error: any) {
      // Handle login errors
      console.error('Login error:', error);

      // Show server error message
      if (error?.response?.data?.non_field_errors) {
        alert(error.response.data.non_field_errors[0]);
      } else if (error?.response?.data?.detail) {
        alert(error.response.data.detail);
      } else if (error?.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert(t('auth.loginError'));
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

      <FormButton isLoading={isSubmitting} title={t('auth.login')} />

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

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
  const { control, handleSubmit, formState: { errors, isSubmitting }, clearErrors, trigger, setError } = useForm<LoginFormValues>({
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
    // Clear previous errors
    clearErrors();
    
    try {
      await passwordLogin.mutateAsync({
        phone: login,
        password
      });
      navigate('/', { replace: true });
    } catch (error: any) {
      // Handle login errors from backend
      const errorData = error?.response?.data;
      
      if (errorData) {
        // Handle non-field errors (general errors)
        if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          setError('root', {
            type: 'server',
            message: errorData.non_field_errors[0]
          });
        } else if (errorData.error) {
          // Handle single error field
          setError('root', {
            type: 'server',
            message: errorData.error
          });
        } else if (errorData.detail) {
          setError('root', {
            type: 'server',
            message: errorData.detail
          });
        } else {
          // Handle field-specific errors
          if (errorData.phone_number && Array.isArray(errorData.phone_number)) {
            setError('login', {
              type: 'server',
              message: errorData.phone_number[0]
            });
          }
          if (errorData.password && Array.isArray(errorData.password)) {
            setError('password', {
              type: 'server',
              message: errorData.password[0]
            });
          }
        }
      } else {
        // Fallback error
        setError('root', {
          type: 'server',
          message: t('auth.loginError')
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      {/* General error message */}
      {errors.root && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-base">{errors.root.message}</p>
        </div>
      )}
      
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

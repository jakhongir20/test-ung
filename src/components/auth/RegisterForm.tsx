import type { FC } from 'react';
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../../api/auth.ts";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";
import { customInstance } from "../../api/mutator/custom-instance";

interface Props {
  className?: string;
}

type RegisterFormValues = {
  pinfl: string;
  login: string;
  password: string;
  confirmPassword: string;
  name: string;
};

const defaultFormValues: RegisterFormValues = {
  pinfl: '',
  login: '',
  password: '',
  confirmPassword: '',
  name: '',
};


export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';

export const RegisterForm: FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const register = useRegister();
  const { t, lang } = useI18n();

  // PINFL fetch state
  const [isFetchingPinfl, setIsFetchingPinfl] = useState(false);
  const [pinflError, setPinflError] = useState<string | null>(null);

  // Employee data from 1C
  const [employeeData, setEmployeeData] = useState<{
    org_name?: string;
    position?: string;
    branch?: string;
    department?: string;
  } | null>(null);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    trigger,
    watch,
    setValue,
    getValues,
    setError
  } = useForm<RegisterFormValues>({
    defaultValues: defaultFormValues,
  });

  const prevLangRef = useRef(lang);
  const password = watch('password');
  const pinfl = watch('pinfl');

  const normalizeText = (value?: string | null) =>
    (value || '')
      .replace(/["«»]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

  // Update validation messages when language changes
  useEffect(() => {
    if (prevLangRef.current !== lang && Object.keys(errors).length > 0) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors();
      trigger();
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors]);

  // Generate secure password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Ensure at least one of each type
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Set both password fields
    setValue('password', password, { shouldDirty: true, shouldValidate: false });
    setValue('confirmPassword', password, { shouldDirty: true, shouldValidate: false });
    
    // Clear any existing errors first
    clearErrors(['password', 'confirmPassword']);
    
    // Trigger validation after both fields are set
    // Use Promise to ensure both setValue calls complete
    Promise.resolve().then(() => {
      // Verify both fields have the same value before validating
      const currentPassword = getValues('password');
      const currentConfirmPassword = getValues('confirmPassword');
      if (currentPassword === currentConfirmPassword && currentPassword === password) {
        trigger(['password', 'confirmPassword']);
      }
    });
  };


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
    validate: (val: string) => {
      const currentPassword = getValues('password');
      return val === currentPassword || t('auth.passwordsDoNotMatch');
    }
  };

  const nameValidationRules = {
    required: t('auth.fieldRequired'),
    minLength: {
      value: 2,
      message: t('auth.nameMinLength')
    }
  };

  // Fetch user data by PINFL
  const handleFetchByPinfl = async () => {
    if (!pinfl || pinfl.trim().length === 0) {
      setPinflError(t('auth.pinflEmpty'));
      return;
    }

    setIsFetchingPinfl(true);
    setPinflError(null);
    setEmployeeData(null); // Clear previous data

    try {
      // Call API to fetch employee data from 1C by PINFL
      const response = await customInstance({
        method: 'POST',
        url: `/api/1c/get-employee/`,
        data: {
          pinfl: pinfl.trim()
        }
      });

      const employeeData = response as {
        employee_id?: string;
        tin?: string;
        full_name?: string;
        pinfl?: string;
        org_code?: number;
        org_name?: string;
        work_status_date?: string;
        birth_date?: string;
        hired_at?: string;
        fired_at?: string;
        work_status?: string;
        passport_issue_date?: string;
        passport_issued_by?: string;
        passport_series?: string;
        home_address?: string;
        phone?: string;
        photo?: string;
        status?: string;
        fte?: string;
        position?: string;
        position_id?: string;
        position_class?: number;
        branch?: string;
        branch_id?: string;
        department?: string;
        department_id?: string;
        department_class?: number;
      };

      // Check if employee was found
      if (employeeData.status !== 'OK') {
        setPinflError(t('auth.pinflNotFound'));
        setEmployeeData(null); // Clear data on error
        return;
      }

      const resolvedPinfl = ((employeeData.pinfl ?? pinfl) || '').toString().trim();
      if (resolvedPinfl) {
        setValue('pinfl', resolvedPinfl, { shouldDirty: true });
        // Set login to PINFL
        setValue('login', resolvedPinfl, { shouldDirty: true });
      } else {
        // Fallback to phone or TIN if PINFL is not available
      const loginValue = (employeeData.phone && employeeData.phone.trim()) ||
        (employeeData.tin && employeeData.tin.toString().trim()) ||
        '';
      if (loginValue) {
        setValue('login', loginValue, { shouldDirty: true });
        }
      }

      const fullName = (employeeData.full_name || '').trim();
      if (fullName) {
        setValue('name', fullName, { shouldDirty: true });
      }

      // Save employee data for display
      setEmployeeData({
        org_name: employeeData.org_name || '',
        position: employeeData.position || '',
        branch: employeeData.branch || '',
        department: employeeData.department || '',
      });

      console.log('✅ Employee data fetched from 1C by PINFL:', employeeData);
    } catch (error) {
      console.log('❌ Failed to fetch employee by PINFL:', error);
      setPinflError(t('auth.pinflNotFound'));
      setEmployeeData(null); // Clear data on error
    } finally {
      setIsFetchingPinfl(false);
    }
  };

  const onSubmit = async (values: RegisterFormValues) => {
    // Clear previous errors
    clearErrors();
    
    try {
      await register.mutateAsync({
        phone: values.login,
        password: values.password,
        name: values.name
      });
      
      // Wait a bit to ensure tokens and user data are stored
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Navigate to home page - user is now authenticated
      navigate('/', { replace: true });
    } catch (error: any) {
      // Handle registration errors from backend
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
          if (errorData.name && Array.isArray(errorData.name)) {
            setError('name', {
              type: 'server',
              message: errorData.name[0]
            });
          }
        }
      } else {
        // Fallback error
        setError('root', {
          type: 'server',
          message: t('auth.registerError')
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="" autoComplete="off">
      {/* General error message */}
      {errors.root && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-base">{errors.root.message}</p>
        </div>
      )}
      
      {/* PINFL Field - Optional */}
      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">
          PINFL
          {/* <span className="text-gray-500 text-sm font-normal">({t('auth.optional')})</span> */}
        </label>
        <div className="flex gap-2">
          <Controller
            name="pinfl"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="PINFL"
                className={authInputStyle + ' flex-1'}
                maxLength={14}
                autoComplete="off"
              />
            )}
          />
          <button
            type="button"
            onClick={handleFetchByPinfl}
            disabled={isFetchingPinfl || !pinfl || pinfl.trim().length === 0}
            className="px-4 py-2 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isFetchingPinfl ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              t('auth.fetch')
            )}
          </button>
        </div>
        {pinflError && <p className="text-red-600 text-base mt-1">{pinflError}</p>}
      </div>

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
                autoComplete="username"
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
                className={authInputStyle + ' bg-gray-50 cursor-not-allowed'}
                autoComplete="name"
                disabled
                readOnly
              />
            )}
          />
        {errors.name && <p className="text-red-600 text-base mt-1">{errors.name.message}</p>}
      </div>

      {/* Employee data from 1C - Display only if available */}
      {employeeData && (
        <>
          {employeeData.org_name && (
            <div className={'mb-6'}>
              <label className="block text-base text-black font-medium mb-1.5">{t('auth.orgName')}</label>
              <input
                type="text"
                value={employeeData.org_name}
                disabled
                className={authInputStyle + ' bg-gray-50 cursor-not-allowed'}
                readOnly
              />
            </div>
          )}
          
          {employeeData.position && (
            <div className={'mb-6'}>
              <label className="block text-base text-black font-medium mb-1.5">{t('auth.position')}</label>
              <input
                type="text"
                value={employeeData.position}
                disabled
                className={authInputStyle + ' bg-gray-50 cursor-not-allowed'}
                readOnly
              />
            </div>
          )}
          
          {employeeData.branch && (
            <div className={'mb-6'}>
              <label className="block text-base text-black font-medium mb-1.5">{t('auth.branch')}</label>
              <input
                type="text"
                value={employeeData.branch}
                disabled
                className={authInputStyle + ' bg-gray-50 cursor-not-allowed'}
                readOnly
              />
            </div>
          )}
          
          {employeeData.department && (
            <div className={'mb-6'}>
              <label className="block text-base text-black font-medium mb-1.5">{t('auth.department')}</label>
              <input
                type="text"
                value={employeeData.department}
                disabled
                className={authInputStyle + ' bg-gray-50 cursor-not-allowed'}
                readOnly
              />
            </div>
          )}
        </>
      )}

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.password')}</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
        <Controller
          name="password"
          control={control}
          rules={passwordValidationRules}
          render={({ field }) => (
            <input
              {...field}
                  type={showPassword ? "text" : "password"}
              placeholder={t('auth.passwordPlaceholder')}
                  className={authInputStyle + ' pr-10'}
                  autoComplete="new-password"
            />
          )}
        />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={generatePassword}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-300 transition-colors whitespace-nowrap flex items-center gap-2"
            title={t('auth.generatePassword')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">{t('auth.generatePassword')}</span>
          </button>
        </div>
        {errors.password && <p className="text-red-600 text-base mt-1">{errors.password.message}</p>}
      </div>

      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.confirmPassword')}</label>
        <div className="relative">
        <Controller
          name="confirmPassword"
          control={control}
          rules={confirmPasswordValidationRules}
          render={({ field }) => (
            <input
              {...field}
                type={showConfirmPassword ? "text" : "password"}
              placeholder={t('auth.confirmPasswordPlaceholder')}
                className={authInputStyle + ' pr-10'}
                autoComplete="new-password"
            />
          )}
        />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-600 text-base mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <FormButton isLoading={isSubmitting} title={t('auth.register')} />

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

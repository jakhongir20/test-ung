import type { FC } from 'react';
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../../api/auth.ts";
import { useUsersMeRetrieve } from "../../api/generated/respondentWebAPI";
import { FormButton } from "./FormButton.tsx";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useI18n } from "../../i18n";

interface Props {
  className?: string;
}

type OtpFormValues = { code: string[]; };

// OTP Input Component
const OtpInput: FC<{
  value: string;
  onChange: (value: string) => void;
  onPaste: (pastedValue: string) => void;
  hasError: boolean;
  index: number;
  onClearError: () => void;
}> = ({ value, onChange, onPaste, hasError, index, onClearError }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, '').slice(0, 1);
    onChange(inputValue);

    // Clear error when user starts typing
    if (hasError) {
      onClearError();
    }

    // Auto-focus next input
    if (inputValue && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pastedData.length >= 6) {
      // Clear error when user pastes
      if (hasError) {
        onClearError();
      }
      onPaste(pastedData.slice(0, 6));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  return (
    <input
      id={`otp-${index}`}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={handleChange}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      className={`
        w-12 h-12 text-center text-lg font-semibold border-1 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-[#00A2DE] focus:border-transparent
        transition-colors duration-200
        ${hasError
          ? 'border-red-500 bg-red-50 text-red-700'
          : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
        }
      `}
    />
  );
};

export const OtpForm: FC<Props> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const { t } = useI18n();
  const { refetch: refetchUser } = useUsersMeRetrieve();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<OtpFormValues>({
    defaultValues: { code: ['', '', '', '', '', ''] },
    mode: 'onSubmit' // Only validate on submit, not onChange
  });

  // Watch the code array for form state
  useWatch({ control, name: 'code' });

  // Function to clear errors when user interacts with inputs
  const clearError = () => {
    clearErrors('code');
  };

  const onSubmit = async (values: OtpFormValues) => {
    const codeString = values.code.join('');

    // Validate that all 6 digits are filled
    if (codeString.length !== 6) {
      setError('code', {
        type: 'manual',
        message: t('otp.enterAllDigits')
      });
      return;
    }

    // Validate that all characters are digits
    if (!/^\d{6}$/.test(codeString)) {
      setError('code', {
        type: 'manual',
        message: t('otp.onlyDigits')
      });
      return;
    }

    try {
      const phone: string = location?.state?.phone?.replace(/\s/g, '') || '';

      // Clear any previous errors before API call
      clearErrors('code');

      await login.mutateAsync({ phone, code: codeString });

      // After successful login, check if user has complete profile
      try {
        const userResponse = await refetchUser();
        const user = userResponse.data;

        // Check if user has complete profile (name)
        if (user && user.name) {
          // User has complete profile, redirect to main page
          navigate('/');
        } else {
          // User needs to complete profile, redirect to profile completion page
          navigate('/profile-completion');
        }
      } catch (userError) {
        // If we can't fetch user data, redirect to profile completion as fallback
        navigate('/profile-completion');
      }
    } catch (error: any) {
      // Handle login errors
      if (error?.response?.data?.non_field_errors?.includes('Invalid OTP code')) {
        setError('code', {
          type: 'manual',
          message: t('otp.invalidCode')
        });
      } else if (error?.response?.data?.otp_code) {
        setError('code', {
          type: 'manual',
          message: error.response.data.otp_code[0] || t('otp.codeError')
        });
      } else {
        setError('code', {
          type: 'manual',
          message: t('otp.loginError')
        });
      }
    }
  };

  const handlePaste = (pastedValue: string) => {
    const digits = pastedValue.split('').slice(0, 6);
    const newCode = [...Array(6).fill('')];
    digits.forEach((digit, index) => {
      newCode[index] = digit;
    });
    setValue('code', newCode);

    // Clear error when user pastes
    clearError();

    // Focus the last filled input or the last input
    const lastFilledIndex = Math.min(digits.length - 1, 5);
    const targetInput = document.getElementById(`otp-${lastFilledIndex}`) as HTMLInputElement;
    targetInput?.focus();
  };

  const hasError = !!errors.code;
  const errorMessage = errors.code?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-6 gap-3 justify-center">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Controller
              key={idx}
              name={`code.${idx}` as const}
              control={control}
              rules={{
                required: t('otp.codeRequired'),
                pattern: {
                  value: /^\d$/,
                  message: t('otp.onlyNumbers')
                }
              }}
              render={({ field }) => (
                <OtpInput
                  value={field.value || ''}
                  onChange={field.onChange}
                  onPaste={handlePaste}
                  hasError={hasError}
                  index={idx}
                  onClearError={clearError}
                />
              )}
            />
          ))}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="text-center">
            <p className="text-base text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 px-4">
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      <FormButton isLoading={login.isPending} title={t('otp.confirm')} />

      <div className="text-base text-gray-600 text-center">
        {t('otp.codeNotReceived')}
        <button
          type="button"
          className="text-cyan-700 cursor-pointer ml-2 hover:underline font-medium"
          onClick={() => {
            setValue('code', ['', '', '', '', '', '']);
            clearError();
            // Focus first input
            const firstInput = document.getElementById('otp-0') as HTMLInputElement;
            firstInput?.focus();
          }}
        >
          {t('otp.resend')}
        </button>
      </div>

      <Link to="/login"
        className="text-cyan-700 flex items-center justify-center text-base w-max mx-auto gap-1.5 hover:underline">
        <ArrowLeftIcon className={'w-4 text-cyan-700'} />
        {t('otp.back')}
      </Link>
    </form>
  );
};

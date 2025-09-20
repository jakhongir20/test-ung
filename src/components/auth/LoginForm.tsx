import type { FC } from 'react';
import { Controller, useForm } from "react-hook-form";
import { MaskedInput } from "antd-mask-input";
import { useNavigate } from "react-router-dom";
import { useSendOtp } from "../../api/auth.ts";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";
import { useEffect, useRef } from "react";

interface Props {
  className?: string;
}


type LoginFormValues = { phone: string; };

const uzPhoneValidate = (val: string, t: (key: string) => string) => {
  const onlyDigits = (val || '').replace(/\D/g, '');
  return onlyDigits.length === 12 && onlyDigits.startsWith('998') || t('auth.invalidPhone');
};

export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';


export const LoginForm: FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const sendOtp = useSendOtp();
  const { t, lang } = useI18n();
  const { control, handleSubmit, formState: { errors, isSubmitting }, clearErrors, trigger } = useForm<LoginFormValues>({
    defaultValues: { phone: '' },
  });

  const prevLangRef = useRef(lang);

  // Update validation messages when language changes
  useEffect(() => {
    if (prevLangRef.current !== lang && errors.phone) {
      // Clear existing errors and re-trigger validation with new language
      clearErrors('phone');
      trigger('phone');
      prevLangRef.current = lang;
    }
  }, [lang, clearErrors, trigger, errors.phone]);

  // Create reactive validation rules
  const validationRules = {
    required: t('auth.fieldRequired'),
    validate: (val: string) => uzPhoneValidate(val, t)
  };

  const onSubmit = async ({ phone }: LoginFormValues) => {
    await sendOtp.mutateAsync(phone.replace(/\s/g, ''));
    navigate('/otp', { replace: true, state: { phone } });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className={'mb-6'}>
        <label className="block text-base text-black font-medium mb-1.5">{t('auth.phoneNumber')}</label>
        <Controller
          name="phone"
          control={control}
          rules={validationRules}
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
      <FormButton isLoading={isSubmitting} title={t('auth.getCode')} />
    </form>
  );
};

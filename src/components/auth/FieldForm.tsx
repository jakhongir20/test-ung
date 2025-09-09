import type { FC } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSendOtp } from "../../api/auth.ts";
import { FormButton } from "./FormButton.tsx";
import { useI18n } from "../../i18n";

interface Props {
  className?: string;
}


type LoginFormValues = { phone: string; };

const uzPhoneValidate = (val: string, t: (key: string) => string) => {
  const onlyDigits = (val || '').replace(/\D/g, '');
  return onlyDigits.length === 12 && onlyDigits.startsWith('998') || t('auth.invalidPhone');
};

export const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-sm !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';


export const FieldForm: FC<Props> = () => {
  const navigate = useNavigate();
  const sendOtp = useSendOtp();
  const { t } = useI18n();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    defaultValues: { phone: '' },
  });

  const onSubmit = async ({ phone }: LoginFormValues) => {
    await sendOtp.mutateAsync(phone.replace(/\s/g, ''));
    navigate('/otp', { replace: true, state: { phone } });
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className={'mb-6'}>
        <label className="block text-sm text-black font-medium mb-1.5">{t('auth.phoneNumber')}</label>

        {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
      </div>
      <FormButton isLoading={isSubmitting} title={t('auth.getCode')} />
    </form>
  );
};

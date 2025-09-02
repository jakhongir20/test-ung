import type { FC } from 'react';
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../../api/auth.ts";
import { authInputStyle } from "./LoginForm.tsx";
import { FormButton } from "./FormButton.tsx";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

interface Props {
  className?: string;
}

type OtpFormValues = { code: string[]; };


export const OtpForm: FC<Props> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const { control, handleSubmit, setValue, getValues } = useForm<OtpFormValues>({
    defaultValues: { code: ['', '', '', '', '', ''] },
  });
  const code = useWatch({ control, name: 'code' });

  const onSubmit = async (values: OtpFormValues) => {
    const code = values.code.join('');
    const phone: string = location?.state?.phone?.replace(/\s/g, '') || '';
    await login.mutateAsync({ phone, code });
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Controller
            key={idx}
            name={`code.${idx}` as const}
            control={control}
            rules={{ required: true, minLength: { value: 1, message: 'Обязательно' } }}
            render={({ field }) => (
              <input
                {...field}
                inputMode="numeric"
                maxLength={1}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                  field.onChange(v);
                  // auto-focus next
                  if (v && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
                  // paste handling if user pasted multiple digits into first box
                  if (e.nativeEvent instanceof InputEvent && e.nativeEvent.inputType === 'insertFromPaste') {
                    const pasted = e.currentTarget.value.replace(/\D/g, '');
                    if (pasted.length > 1) {
                      const arr = (getValues('code') || Array(6).fill('')).slice();
                      for (let i = 0; i < pasted.length && idx + i < 6; i++) arr[idx + i] = pasted[i];
                      setValue('code', arr as any);
                      const focusTo = Math.min(idx + pasted.length, 5);
                      document.getElementById(`otp-${focusTo}`)?.focus();
                    }
                  }
                }}
                id={`otp-${idx}`}
                className={authInputStyle}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !code?.[idx] && idx > 0) {
                    // clear previous and move focus back
                    const arr = (getValues('code') || Array(6).fill('')).slice();
                    arr[idx - 1] = '';
                    setValue('code', arr as any);
                    document.getElementById(`otp-${idx - 1}`)?.focus();
                    e.preventDefault();
                  }
                  if (e.key === 'ArrowLeft' && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
                  if (e.key === 'ArrowRight' && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
                }}
              />
            )}
          />
        ))}
      </div>
      <FormButton isLoading={login.isPending} title={'Подтвердить'} />

      <div className="text-sm text-gray-600">Код не пришел?
        <button
          type="button"
          className="text-cyan-700 cursor-pointer ml-2 hover:underline"
          onClick={() => setValue('code', ['', '', '', '', '', ''])}
        >
          Отправить заново
        </button>
      </div>
      <Link to="/login"
        className="text-cyan-700 flex items-center justify-start text-sm w-max bg-red gap-1.5 hover:underline">
        <ArrowLeftIcon className={'w-4 text-cyan-700'} />
        Назад
      </Link>
    </form>
  );
};

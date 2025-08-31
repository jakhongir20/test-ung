import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLogin } from '../api/auth';

type OtpFormValues = { code: string[]; };

const OtpPage: FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const login = useLogin();
  const { control, handleSubmit, setValue } = useForm<OtpFormValues>({
    defaultValues: { code: ['', '', '', '', '', ''] },
  });

  const onSubmit = async (values: OtpFormValues) => {
    const code = values.code.join('');
    const phone: string = location?.state?.phone?.replace(/\s/g, '') || '';
    await login.mutateAsync({ phone, code });
    navigate('/');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className="order-2 lg:order-1">
        <div className="mx-auto max-w-md w-full rounded-2xl bg-white p-6 ring-1 ring-gray-200 shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Подтверждение</h1>
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
                        if (v && idx < 5) {
                          const next = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement | null;
                          next?.focus();
                        }
                      }}
                      id={`otp-${idx}`}
                      className="h-12 text-center rounded-lg ring-1 ring-gray-300 focus:ring-2 focus:ring-cyan-600"
                    />
                  )}
                />
              ))}
            </div>
            <button type="submit" className="w-full rounded-lg bg-cyan-600 text-white py-2 hover:bg-cyan-700">Подтвердить</button>
            <div className="text-sm text-gray-600">Код не пришел? <button type="button" className="text-cyan-700 hover:underline" onClick={() => setValue('code', ['', '', '', '', '', ''])}>Отправить заново</button></div>
            <div className="text-sm"><Link to="/login" className="text-cyan-700 hover:underline">Назад</Link></div>
          </form>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <div className="aspect-[4/3] w-full rounded-3xl bg-cyan-600 grid place-items-center text-white">
          <div className="text-3xl font-semibold">TestLUNG</div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage



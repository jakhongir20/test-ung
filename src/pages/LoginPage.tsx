import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MaskedInput } from 'antd-mask-input';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';

type LoginFormValues = { phone: string; };

const uzPhoneValidate = (val: string) => {
  const onlyDigits = (val || '').replace(/\D/g, '');
  return onlyDigits.length === 12 && onlyDigits.startsWith('998') || 'Неверный номер';
};

const authInputStyle = 'mt-1 block w-full rounded-lg border-gray-300 focus:ring-cyan-500 focus:border-cyan-500 px-3 py-2';

const LoginPage: FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    defaultValues: { phone: '' },
  });

  const onSubmit = async () => {
    // Here you would call API to send OTP. For now, navigate to OTP.
    navigate('/otp', { replace: true });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      <div className="order-2 lg:order-1">
        <div className="mx-auto max-w-md w-full rounded-2xl bg-white p-6 ring-1 ring-gray-200 shadow-sm">
          <h1 className="text-xl font-semibold mb-4">Войти</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Номер телефона</label>
              <Controller
                name="phone"
                control={control}
                rules={{ required: 'Поле обязательно', validate: uzPhoneValidate }}
                render={({ field }) => (
                  <MaskedInput
                    {...field}
                    mask="+998 00 000 00 00"
                    placeholder={'+998'}
                    size="large"
                    className={authInputStyle}
                  />
                )}
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-cyan-600 text-white py-2 hover:bg-cyan-700 disabled:opacity-50">Получить код</button>
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

export default LoginPage



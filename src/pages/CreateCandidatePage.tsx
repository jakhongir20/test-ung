import type { FC } from 'react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { customInstance } from '../api/mutator/custom-instance';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { PageTransition } from '../components/animations';
import { CARD_STYLES } from '../components/test/test.data';

type CreateCandidateFormValues = {
  phone_number: string;
  name: string;
  password: string;
  confirmPassword: string;
};

const authInputStyle = 'block !border-1 w-full !text-[#64748B] focus:!text-black !text-base !h-11 !rounded-xl border-[#E2E8F0] focus:ring-[#00A2DE] focus:border-[#00A2DE] px-3 py-2';

const CreateCandidatePage: FC = () => {
  const {t} = useI18n();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setError,
    watch,
    setValue,
    getValues,
    clearErrors,
    trigger
  } = useForm<CreateCandidateFormValues>({
    defaultValues: {
      phone_number: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  // Generate secure password
  const generatePassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let generatedPassword = '';

    // Ensure at least one of each type
    generatedPassword += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    generatedPassword += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    generatedPassword += '0123456789'[Math.floor(Math.random() * 10)]; // number
    generatedPassword += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special

    // Fill the rest
    for (let i = generatedPassword.length; i < length; i++) {
      generatedPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle
    generatedPassword = generatedPassword.split('').sort(() => Math.random() - 0.5).join('');

    setValue('password', generatedPassword, {shouldDirty: true});
    setValue('confirmPassword', generatedPassword, {shouldDirty: true});
    clearErrors('password');
    clearErrors('confirmPassword');
    trigger('password');
    trigger('confirmPassword');
  };

  const passwordValidationRules = {
    required: t('auth.passwordRequired'),
    minLength: {
      value: 8,
      message: t('auth.passwordMinLength')
    }
  };

  const confirmPasswordValidationRules = {
    required: t('auth.confirmPasswordRequired'),
    validate: (value: string) => {
      const passwordValue = getValues('password');
      if (value !== passwordValue) {
        return t('auth.passwordsDoNotMatch');
      }
      return true;
    }
  };

  const onSubmit = async (values: CreateCandidateFormValues) => {
    try {
      setIsSubmitting(true);

      const response = await customInstance({
        method: 'POST',
        url: '/api/moderator/users/create-candidate/',
        data: {
          phone_number: values.phone_number,
          name: values.name,
          password: values.password,
        },
      });

      // Show success message and navigate back
      alert(t('admin.candidateCreatedSuccess'));
      navigate('/admin/employees');
    } catch (error: any) {
      const errorData = error?.response?.data;
      if (errorData) {
        if (errorData.error) {
          setError('root', {type: 'server', message: errorData.error});
        } else if (errorData.phone_number) {
          setError('phone_number', {type: 'server', message: errorData.phone_number[0]});
        } else if (errorData.name) {
          setError('name', {type: 'server', message: errorData.name[0]});
        } else if (errorData.password) {
          setError('password', {type: 'server', message: errorData.password[0]});
        } else if (errorData.detail) {
          setError('root', {type: 'server', message: errorData.detail});
        }
      } else {
        setError('root', {type: 'server', message: t('admin.candidateCreateError')});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BackgroundWrapper>
      <PageTransition>
        <div className="md:p-6">
          <section className={CARD_STYLES}>
            <div className="">
              <h3 className="text-xl md:text-2xl font-semibold mb-6">{t('admin.createCandidate')}</h3>

              <form onSubmit={handleSubmit(onSubmit)} className="" autoComplete="off">
                {errors.root && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {errors.root.message}
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-base text-black font-medium mb-1.5">{t('auth.phone')}</label>
                  <Controller
                    name="phone_number"
                    control={control}
                    rules={{required: t('auth.phoneRequired')}}
                    render={({field}) => (
                      <input
                        {...field}
                        type="text"
                        placeholder={t('auth.phonePlaceholder')}
                        className={authInputStyle}
                        autoComplete="username"
                      />
                    )}
                  />
                  {errors.phone_number && (
                    <p className="text-red-600 text-base mt-1">{errors.phone_number.message}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-base text-black font-medium mb-1.5">{t('auth.name')}</label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{required: t('auth.nameRequired')}}
                    render={({field}) => (
                      <input
                        {...field}
                        type="text"
                        placeholder={t('auth.fullNamePlaceholder')}
                        className={authInputStyle}
                        autoComplete="name"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-base mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-base text-black font-medium mb-1.5">{t('auth.password')}</label>
                  <div className="relative flex gap-2">
                    <Controller
                      name="password"
                      control={control}
                      rules={passwordValidationRules}
                      render={({field}) => (
                        <input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder={t('auth.passwordPlaceholder')}
                          className={authInputStyle + ' flex-1 pr-10'}
                          autoComplete="new-password"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-[127px] flex items-center px-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border border-gray-300 transition-colors whitespace-nowrap flex items-center gap-2"
                      title={t('auth.generatePassword')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                           stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      <span className="hidden sm:inline">{t('auth.generatePassword')}</span>
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-base mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-base text-black font-medium mb-1.5">{t('auth.confirmPassword')}</label>
                  <div className="relative">
                    <Controller
                      name="confirmPassword"
                      control={control}
                      rules={confirmPasswordValidationRules}
                      render={({field}) => (
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
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                             stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-base mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
                  <p className="text-sm">{t('admin.candidateExpirationWarning')}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/employees')}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {isSubmitting ? t('admin.creating') : t('admin.create')}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </PageTransition>
    </BackgroundWrapper>
  );
};

export default CreateCandidatePage;


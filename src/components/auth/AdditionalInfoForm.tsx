import type { FC } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { FormButton } from "./FormButton.tsx";
import { authInputStyle } from "./LoginForm.tsx";
import { useUpdateAdditionalInfo } from "../../api/auth";

interface Props {
  className?: string;
}

type AdditionalInfoFormValues = {
  name: string;
  position: string;
  gasType: string;
  region: string;
};

export const AdditionalInfoForm: FC<Props> = ({ }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const updateAdditionalInfo = useUpdateAdditionalInfo();

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, clearErrors } = useForm<AdditionalInfoFormValues>({
    defaultValues: {
      name: '',
      position: '',
      gasType: '',
      region: ''
    },
  });

  const onSubmit = async (data: AdditionalInfoFormValues) => {
    try {
      clearErrors();

      await updateAdditionalInfo.mutateAsync({
        name: data.name.trim(),
        position: data.position.trim(),
        gasType: data.gasType.trim(),
        region: data.region.trim()
      });

      // Navigate to main page on success
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Error submitting additional info:', error);

      // Handle API errors
      if (error?.response?.data?.name) {
        setError('name', {
          type: 'manual',
          message: error.response.data.name[0] || t('additionalInfo.nameRequired')
        });
      }
      if (error?.response?.data?.position) {
        setError('position', {
          type: 'manual',
          message: error.response.data.position[0] || t('additionalInfo.positionRequired')
        });
      }
      if (error?.response?.data?.gasType) {
        setError('gasType', {
          type: 'manual',
          message: error.response.data.gasType[0] || t('additionalInfo.gasTypeRequired')
        });
      }
      if (error?.response?.data?.region) {
        setError('region', {
          type: 'manual',
          message: error.response.data.region[0] || t('additionalInfo.regionRequired')
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      <div className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm text-black font-medium mb-1.5">
            {t('additionalInfo.name')}
          </label>
          <Controller
            name="name"
            control={control}
            rules={{ required: t('additionalInfo.nameRequired') }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder={t('additionalInfo.namePlaceholder')}
                className={`${authInputStyle} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
            )}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Position Dropdown */}
        <div>
          <label className="block text-sm text-black font-medium mb-1.5">
            {t('additionalInfo.position')}
          </label>
          <Controller
            name="position"
            control={control}
            rules={{ required: t('additionalInfo.positionRequired') }}
            render={({ field }) => (
              <select
                {...field}
                className={`${authInputStyle} ${errors.position ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">{t('additionalInfo.positionPlaceholder')}</option>
                <option value="manager">{t('position.manager')}</option>
                <option value="engineer">{t('position.engineer')}</option>
                <option value="technician">{t('position.technician')}</option>
                <option value="supervisor">{t('position.supervisor')}</option>
                <option value="operator">{t('position.operator')}</option>
              </select>
            )}
          />
          {errors.position && (
            <p className="text-red-600 text-sm mt-1">{errors.position.message}</p>
          )}
        </div>

        {/* Gas Type Dropdown */}
        <div>
          <label className="block text-sm text-black font-medium mb-1.5">
            {t('additionalInfo.gasType')}
          </label>
          <Controller
            name="gasType"
            control={control}
            rules={{ required: t('additionalInfo.gasTypeRequired') }}
            render={({ field }) => (
              <select
                {...field}
                className={`${authInputStyle} ${errors.gasType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">{t('additionalInfo.naturalGas')}</option>
                <option value="natural">{t('additionalInfo.naturalGas')}</option>
                <option value="lpg">LPG</option>
                <option value="propane">Propane</option>
                <option value="butane">Butane</option>
              </select>
            )}
          />
          {errors.gasType && (
            <p className="text-red-600 text-sm mt-1">{errors.gasType.message}</p>
          )}
        </div>

        {/* Region Dropdown */}
        <div>
          <label className="block text-sm text-black font-medium mb-1.5">
            {t('additionalInfo.region')}
          </label>
          <Controller
            name="region"
            control={control}
            rules={{ required: t('additionalInfo.regionRequired') }}
            render={({ field }) => (
              <select
                {...field}
                className={`${authInputStyle} ${errors.region ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">{t('additionalInfo.tashkent')}</option>
                <option value="tashkent">{t('additionalInfo.tashkent')}</option>
                <option value="samarkand">{t('region.samarkand')}</option>
                <option value="bukhara">{t('region.bukhara')}</option>
                <option value="namangan">{t('region.namangan')}</option>
                <option value="andijan">{t('region.andijan')}</option>
                <option value="fergana">{t('region.fergana')}</option>
                <option value="kashkadarya">{t('region.kashkadarya')}</option>
                <option value="surkhandarya">{t('region.surkhandarya')}</option>
                <option value="khorezm">{t('region.khorezm')}</option>
                <option value="karakalpakstan">{t('region.karakalpakstan')}</option>
                <option value="jizzakh">{t('region.jizzakh')}</option>
                <option value="sirdarya">{t('region.sirdarya')}</option>
                <option value="tashkent-region">{t('region.tashkentRegion')}</option>
              </select>
            )}
          />
          {errors.region && (
            <p className="text-red-600 text-sm mt-1">{errors.region.message}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <FormButton isLoading={isSubmitting} title={t('additionalInfo.enter')} />
      </div>
    </form>
  );
};

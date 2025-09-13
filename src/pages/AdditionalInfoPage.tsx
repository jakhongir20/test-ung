import type { FC } from 'react';
import { AdditionalInfoForm } from '../components/auth/AdditionalInfoForm';
import { FormContainer } from '../components/auth/FormContainer';
import { useI18n } from '../i18n';

const AdditionalInfoPage: FC = () => {
  const { t } = useI18n();

  return (
    <FormContainer title={t('additionalInfo.title')}>
      <AdditionalInfoForm />
    </FormContainer>
  );
};

export default AdditionalInfoPage;

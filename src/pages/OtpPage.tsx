import type { FC } from 'react';
import { OtpForm } from "../components/auth/OtpForm.tsx";
import { FormContainer } from "../components/auth/FormContainer.tsx";
import { useI18n } from "../i18n";

const OtpPage: FC = () => {
  const { t } = useI18n();

  return (
    <FormContainer title={t('auth.confirmLogin')}>
      <OtpForm />
    </FormContainer>
  );
};

export default OtpPage



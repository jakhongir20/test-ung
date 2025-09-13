import type { FC } from 'react';
import { FormContainer } from "../components/auth/FormContainer.tsx";
import { FieldForm } from "../components/auth/FieldForm.tsx";
import { useI18n } from "../i18n";

const FieldPage: FC = () => {
  const { t } = useI18n();

  return (
    <FormContainer title={t('auth.login')}>
      <FieldForm />
    </FormContainer>
  );
};

export default FieldPage



import type { FC } from 'react';
import { RegisterForm } from "../components/auth/RegisterForm.tsx";
import { FormContainer } from "../components/auth/FormContainer.tsx";
import { useI18n } from "../i18n";

const RegisterPage: FC = () => {
  const { t } = useI18n();

  return (
    <FormContainer title={t('auth.register')}>
      <RegisterForm />
    </FormContainer>
  );
};

export default RegisterPage;
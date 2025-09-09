import type { FC } from 'react';
import { LoginForm } from "../components/auth/LoginForm.tsx";
import { FormContainer } from "../components/auth/FormContainer.tsx";
import { useI18n } from "../i18n";

const LoginPage: FC = () => {
  const { t } = useI18n();

  return (
    <FormContainer title={t('auth.login')}>
      <LoginForm />
    </FormContainer>
  );
};

export default LoginPage



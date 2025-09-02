import type { FC } from 'react';
import { LoginForm } from "../components/auth/LoginForm.tsx";
import { FormContainer } from "../components/auth/FormContainer.tsx";

const LoginPage: FC = () => {


  return (
    <FormContainer title={'Войти'}>
      <LoginForm/>
    </FormContainer>
  );
};

export default LoginPage



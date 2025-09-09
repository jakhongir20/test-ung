import type { FC } from 'react';
import { FormContainer } from "../components/auth/FormContainer.tsx";
import { FieldForm } from "../components/auth/FieldForm.tsx";

const FieldPage: FC = () => {


  return (
    <FormContainer title={'Войти'}>
      <FieldForm/>
    </FormContainer>
  );
};

export default FieldPage



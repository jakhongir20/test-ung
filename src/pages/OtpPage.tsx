import type { FC } from 'react';
import { OtpForm } from "../components/auth/OtpForm.tsx";
import { FormContainer } from "../components/auth/FormContainer.tsx";


const OtpPage: FC = () => {

  return (
    <FormContainer title={'Подтверждение входа'}>
      <OtpForm/>
    </FormContainer>
  );
};

export default OtpPage



import type { FC } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsersMeRetrieve } from '../api/generated/respondentWebAPI';
import { ProfileCompletionForm } from '../components/auth/ProfileCompletionForm';
import { FormContainer } from '../components/auth/FormContainer';
import { useI18n } from '../i18n';

const ProfileCompletionPage: FC = () => {
  const navigate = useNavigate();
  const {t} = useI18n();
  const {data: user, isLoading, error} = useUsersMeRetrieve();

  useEffect(() => {
    // If user data is loaded and user has all required fields, redirect to main page
    if (user && user.name && user.branch && user.position && user.employee_level && user.work_domain) {
      navigate('/', {replace: true});
    }
  }, [user, navigate]);

  // If loading, show loading state
  if (isLoading) {
    return (
      <FormContainer title={t('profileCompletion.title')}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A2DE] mx-auto"></div>
          <p className="text-gray-600 mt-2">{t('loading')}</p>
        </div>
      </FormContainer>
    );
  }

  // If there's an error, redirect to login
  if (error) {
    navigate('/login', {replace: true});
    return null;
  }

  // If user already has complete profile, redirect to main page
  if (user && user.name && user.branch && user.position && user.employee_level && user.work_domain) {
    navigate('/', {replace: true});
    return null;
  }

  return (
    <FormContainer title={t('profileCompletion.title')}>
      <ProfileCompletionForm/>
    </FormContainer>
  );
};

export default ProfileCompletionPage;


import { customInstance } from './mutator/custom-instance';

// Certificate data response type based on new API structure
export interface CertificateData {
  id: string;
  certificate_order: number;
  attempt_number: number;
  user_name: string;
  user_branch: string;
  user_branch_uz?: string;
  user_branch_uz_cyrl?: string;
  user_branch_ru?: string;
  user_position: string;
  user_work_domain: string;
  user_employee_level: string;
  survey_title: string;
  survey_description: string;
  score: number;
  total_points: number;
  percentage: string;
  is_passed: boolean;
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  language: string;
}

// Fetch certificate data by user ID
export const fetchCertificateData = async (
  userId: string
): Promise<CertificateData> => {
  const response = await customInstance<CertificateData>({
    method: 'GET',
    url: `/api/certificate/user/${userId}/certificate/data/`,
  });
  return response;
};

// Download certificate by user ID
export const downloadCertificate = async (userId: string): Promise<Blob> => {
  const response = await customInstance<Blob>({
    method: 'GET',
    url: `/api/certificate/user/${userId}/certificate/download/`,
    responseType: 'blob',
  });
  return response;
};

// Hook for fetching certificate data
export const useCertificateData = (userId: string) => {
  return {
    fetchData: () => fetchCertificateData(userId),
    download: () => downloadCertificate(userId),
  };
};

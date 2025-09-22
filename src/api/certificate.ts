import { customInstance } from './mutator/custom-instance';

// Certificate data response type
export interface CertificateData {
  id: string;
  user: {
    id: number;
    name: string;
    position: string;
    branch: string;
    phone_number: string;
  };
  survey: {
    id: number;
    title: string;
    description: string;
  };
  percentage: number;
  score: number;
  total_points: number;
  completed_at: string;
  certificate_number: string;
}

// Fetch certificate data
export const fetchCertificateData = async (userId: number): Promise<CertificateData> => {
  const response = await customInstance<CertificateData>({
    method: 'GET',
    url: `/api/certificate/user/${userId}/certificate/data/`
  });
  return response;
};

// Download certificate
export const downloadCertificate = async (userId: number): Promise<Blob> => {
  const response = await customInstance<Blob>({
    method: 'GET',
    url: `/api/certificate/user/${userId}/certificate/download/`,
    responseType: 'blob'
  });
  return response;
};

// Hook for fetching certificate data
export const useCertificateData = (userId: number) => {
  return {
    fetchData: () => fetchCertificateData(userId),
    download: () => downloadCertificate(userId)
  };
};

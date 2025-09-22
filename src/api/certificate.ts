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

// Fetch certificate data by certificate ID
export const fetchCertificateData = async (certificateId: string): Promise<CertificateData> => {
  const response = await customInstance<CertificateData>({
    method: 'GET',
    url: `/api/certificate/test/certificate/${certificateId}/data/`
  });
  return response;
};

// Download certificate by certificate ID
export const downloadCertificate = async (certificateId: string): Promise<Blob> => {
  const response = await customInstance<Blob>({
    method: 'GET',
    url: `/api/certificate/test/certificate/${certificateId}/download/`,
    responseType: 'blob'
  });
  return response;
};

// Hook for fetching certificate data
export const useCertificateData = (certificateId: string) => {
  return {
    fetchData: () => fetchCertificateData(certificateId),
    download: () => downloadCertificate(certificateId)
  };
};

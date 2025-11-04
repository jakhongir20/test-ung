import { fetchCertificateData, downloadCertificate } from '../api/certificate';

// Test function to verify certificate API endpoints
export const testCertificateAPI = async (certificateId: string) => {

  try {
    // Test data endpoint

    const data = await fetchCertificateData(certificateId);

    // Test download endpoint

    const blob = await downloadCertificate(certificateId);

    return { success: true, data, blob };
  } catch (error: any) {


    return { success: false, error };
  }
};

// Test with the provided certificate ID
export const testWithProvidedID = () => {
  const testId = 'f0cb3e6f-a4c8-4f73-8697-711ecf402b6c';
  return testCertificateAPI(testId);
};

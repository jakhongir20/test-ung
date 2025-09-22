import { fetchCertificateData, downloadCertificate } from '../api/certificate';

// Test function to verify certificate API endpoints
export const testCertificateAPI = async (certificateId: string) => {
  console.log('🧪 Testing Certificate API with ID:', certificateId);
  
  try {
    // Test data endpoint
    console.log('📊 Testing certificate data endpoint...');
    const data = await fetchCertificateData(certificateId);
    console.log('✅ Certificate data loaded:', data);
    
    // Test download endpoint
    console.log('📥 Testing certificate download endpoint...');
    const blob = await downloadCertificate(certificateId);
    console.log('✅ Certificate download successful, blob size:', blob.size);
    
    return { success: true, data, blob };
  } catch (error: any) {
    console.error('❌ Certificate API test failed:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data
    });
    return { success: false, error };
  }
};

// Test with the provided certificate ID
export const testWithProvidedID = () => {
  const testId = 'f0cb3e6f-a4c8-4f73-8697-711ecf402b6c';
  return testCertificateAPI(testId);
};

import { createContext, useContext } from 'react';

export const BusinessConfigurationContext = createContext({
  configuration: null,
  isLoading: false,
  error: '',
  refreshConfiguration: async () => null,
  updateConfiguration: async () => null,
  uploadLogo: async () => null,
});

export function useBusinessConfiguration() {
  return useContext(BusinessConfigurationContext);
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getBusinessConfiguration,
  updateBusinessConfiguration,
  uploadBusinessLogo,
} from '../../entities/business/businessApi.js';
import { normalizeBusinessConfiguration } from '../../entities/business/businessModel.js';
import { getApiMessage } from '../../shared/api/apiResponse.js';
import { BusinessConfigurationContext } from '../../shared/hooks/useBusinessConfiguration.js';

export function BusinessConfigurationProvider({ children }) {
  const [configuration, setConfiguration] = useState(() => normalizeBusinessConfiguration(null));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshConfiguration = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const nextConfiguration = await getBusinessConfiguration();
      setConfiguration(nextConfiguration);
      return nextConfiguration;
    } catch (requestError) {
      setError(getApiMessage(requestError, 'No se pudo cargar la configuración del negocio.'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfiguration();
  }, [refreshConfiguration]);

  const updateConfiguration = useCallback(async (payload) => {
    const nextConfiguration = await updateBusinessConfiguration(payload);
    setConfiguration(nextConfiguration);
    setError('');
    return nextConfiguration;
  }, []);

  const uploadLogo = useCallback(async (file) => {
    const nextConfiguration = await uploadBusinessLogo(file);
    setConfiguration(nextConfiguration);
    setError('');
    return nextConfiguration;
  }, []);

  const value = useMemo(
    () => ({
      configuration,
      isLoading,
      error,
      refreshConfiguration,
      updateConfiguration,
      uploadLogo,
    }),
    [configuration, error, isLoading, refreshConfiguration, updateConfiguration, uploadLogo],
  );

  return (
    <BusinessConfigurationContext.Provider value={value}>
      {children}
    </BusinessConfigurationContext.Provider>
  );
}

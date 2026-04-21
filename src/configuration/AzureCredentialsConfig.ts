import {
  AzureCredentials,
  AzureDataSourceJsonData,
  AzureDataSourceSecureJsonData,
  AzureDataSourceSettings,
  getAzureClouds,
  getDatasourceCredentials,
  getDefaultAzureCloud,
  updateDatasourceCredentials,
} from '@grafana/azure-sdk';
import { DataSourceSettings, SelectableValue } from '@grafana/data';
import { PromOptions } from '@grafana/prometheus';
import { config } from '@grafana/runtime';

import { FederatedIdentityCredentialsType } from './FederatedIdentityCredentials';

export type ExtendedAzureCredentials = AzureCredentials | FederatedIdentityCredentialsType;

export function getAzureCloudOptions(): Array<SelectableValue<string>> {
  const cloudInfo = getAzureClouds();

  return cloudInfo.map((cloud) => ({
    value: cloud.name,
    label: cloud.displayName,
  }));
}

export function getDefaultCredentials(): AzureCredentials {
  if (config.azure?.userIdentityEnabled) {
    return { authType: 'currentuser' };
  }
  return { authType: 'clientsecret', azureCloud: getDefaultAzureCloud() };
}

export function getCredentials(options: AzureDataSourceSettings): ExtendedAzureCredentials {
  // Handle federated identity credentials locally since @grafana/azure-sdk doesn't know about them
  const rawCredentials = options.jsonData.azureCredentials as ExtendedAzureCredentials | undefined;
  if (rawCredentials?.authType === 'federatedidentity') {
    return rawCredentials as FederatedIdentityCredentialsType;
  }

  const credentials = getDatasourceCredentials(options);
  if (credentials) {
    return credentials;
  }

  return getDefaultCredentials();
}

export function updateCredentials(
  options: AzurePromDataSourceSettings,
  credentials: ExtendedAzureCredentials
): AzurePromDataSourceSettings {
  // Handle federated identity credentials locally since @grafana/azure-sdk doesn't know about them
  if (credentials.authType === 'federatedidentity') {
    return {
      ...options,
      jsonData: {
        ...options.jsonData,
        azureCredentials: credentials as unknown as AzureCredentials,
        azureAuthType: undefined,
        cloudName: undefined,
        tenantId: undefined,
        clientId: undefined,
      },
    };
  }

  return updateDatasourceCredentials(options, credentials as AzureCredentials);
}

export function setDefaultCredentials(options: AzurePromDataSourceSettings): AzurePromDataSourceSettings {
  return {
    ...options,
    jsonData: {
      ...options.jsonData,
      azureCredentials: getDefaultCredentials(),
    },
  };
}

export function resetCredentials(options: AzurePromDataSourceSettings): Partial<AzurePromDataSourceSettings> {
  return {
    jsonData: {
      ...options.jsonData,
      azureCredentials: undefined,
      azureEndpointResourceId: undefined,
    },
  };
}

export interface AzurePromDataSourceOptions extends PromOptions, AzureDataSourceJsonData {
  azureEndpointResourceId?: string;
  'prometheus-type-migration'?: boolean;
}

export type AzurePromDataSourceSettings = DataSourceSettings<AzurePromDataSourceOptions, AzureDataSourceSecureJsonData>;

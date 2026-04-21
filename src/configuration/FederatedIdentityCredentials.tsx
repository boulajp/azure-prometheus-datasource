import { SelectableValue } from '@grafana/data';
import { t } from '@grafana/i18n';
import { Field, Select, Input } from '@grafana/ui';
import React, { ChangeEvent } from 'react';

/**
 * Federated Identity credentials for cross-tenant authentication.
 * This type extends beyond what @grafana/azure-sdk currently defines,
 * so we define it locally until the SDK is updated.
 */
export interface FederatedIdentityCredentialsType {
  authType: 'federatedidentity';
  sourceIdentityType?: string;
  sourceClientId?: string;
  targetTenantId?: string;
  targetClientId?: string;
  federatedCredentialAudience?: string;
}

export interface FederatedIdentityCredentialsProps {
  credentials: FederatedIdentityCredentialsType;
  onCredentialsChange: (updatedCredentials: FederatedIdentityCredentialsType) => void;
  disabled?: boolean;
  managedIdentityEnabled: boolean;
  workloadIdentityEnabled: boolean;
}

const AUDIENCE_OPTIONS: Array<SelectableValue<string>> = [
  { value: 'api://AzureADTokenExchange', label: 'Public (api://AzureADTokenExchange)' },
  { value: 'api://AzureADTokenExchangeUSGov', label: 'US Government (api://AzureADTokenExchangeUSGov)' },
  { value: 'api://AzureADTokenExchangeChina', label: 'China (api://AzureADTokenExchangeChina)' },
  { value: 'api://AzureADTokenExchangeUSNat', label: 'USNat (api://AzureADTokenExchangeUSNat)' },
  { value: 'api://AzureADTokenExchangeUSSec', label: 'USSec (api://AzureADTokenExchangeUSSec)' },
];

export const FederatedIdentityCredentials = (props: FederatedIdentityCredentialsProps) => {
  const { credentials, onCredentialsChange, disabled, managedIdentityEnabled, workloadIdentityEnabled } = props;

  const sourceIdentityOptions: Array<SelectableValue<string>> = [];
  if (managedIdentityEnabled) {
    sourceIdentityOptions.push({
      value: 'msi',
      label: t(
        'configuration.federated-identity-credentials.source-identity.managed-identity',
        'Managed Identity'
      ),
    });
  }
  if (workloadIdentityEnabled) {
    sourceIdentityOptions.push({
      value: 'workloadidentity',
      label: t(
        'configuration.federated-identity-credentials.source-identity.workload-identity',
        'Workload Identity'
      ),
    });
  }

  const onSourceIdentityTypeChange = (selected: SelectableValue<string>) => {
    onCredentialsChange({
      ...credentials,
      sourceIdentityType: selected.value,
    });
  };

  const onSourceClientIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      sourceClientId: event.target.value,
    });
  };

  const onTargetTenantIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      targetTenantId: event.target.value,
    });
  };

  const onTargetClientIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCredentialsChange({
      ...credentials,
      targetClientId: event.target.value,
    });
  };

  const onAudienceChange = (selected: SelectableValue<string>) => {
    onCredentialsChange({
      ...credentials,
      federatedCredentialAudience: selected.value,
    });
  };

  return (
    <>
      <Field
        label={t(
          'configuration.federated-identity-credentials.label-source-credential-type',
          'Source Credential Type'
        )}
        description={t(
          'configuration.federated-identity-credentials.description-source-credential-type',
          'The identity type in the local tenant used to obtain the initial token'
        )}
        htmlFor="source-identity-type"
      >
        <Select
          inputId="source-identity-type"
          className="width-30"
          value={sourceIdentityOptions.find((opt) => opt.value === credentials.sourceIdentityType)}
          options={sourceIdentityOptions}
          onChange={onSourceIdentityTypeChange}
          isDisabled={disabled}
        />
      </Field>
      <Field
        label={t(
          'configuration.federated-identity-credentials.label-source-client-id',
          'Source Client ID (optional)'
        )}
        description={t(
          'configuration.federated-identity-credentials.description-source-client-id',
          'Client ID for the source identity. Leave empty to use the default from Grafana config.'
        )}
        htmlFor="source-client-id"
      >
        <Input
          id="source-client-id"
          className="width-30"
          // eslint-disable-next-line @grafana/i18n/no-untranslated-strings
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          value={credentials.sourceClientId || ''}
          onChange={onSourceClientIdChange}
          disabled={disabled}
        />
      </Field>
      <Field
        label={t(
          'configuration.federated-identity-credentials.label-target-tenant-id',
          'Target Tenant ID'
        )}
        description={t(
          'configuration.federated-identity-credentials.description-target-tenant-id',
          'The tenant ID of the remote Azure AD tenant where the resource resides'
        )}
        required
        htmlFor="target-tenant-id"
        invalid={!credentials.targetTenantId}
        error={t('configuration.federated-identity-credentials.error-target-tenant-id', 'Target Tenant ID is required')}
      >
        <Input
          id="target-tenant-id"
          className="width-30"
          // eslint-disable-next-line @grafana/i18n/no-untranslated-strings
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          value={credentials.targetTenantId || ''}
          onChange={onTargetTenantIdChange}
          disabled={disabled}
        />
      </Field>
      <Field
        label={t(
          'configuration.federated-identity-credentials.label-target-client-id',
          'Target Client ID'
        )}
        description={t(
          'configuration.federated-identity-credentials.description-target-client-id',
          'The application (client) ID of the app registration in the remote tenant'
        )}
        required
        htmlFor="target-client-id"
        invalid={!credentials.targetClientId}
        error={t('configuration.federated-identity-credentials.error-target-client-id', 'Target Client ID is required')}
      >
        <Input
          id="target-client-id"
          className="width-30"
          // eslint-disable-next-line @grafana/i18n/no-untranslated-strings
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          value={credentials.targetClientId || ''}
          onChange={onTargetClientIdChange}
          disabled={disabled}
        />
      </Field>
      <Field
        label={t(
          'configuration.federated-identity-credentials.label-audience',
          'Federated Credential Audience'
        )}
        description={t(
          'configuration.federated-identity-credentials.description-audience',
          'The audience value configured on the federated identity credential in the remote tenant'
        )}
        required
        htmlFor="federated-credential-audience"
      >
        <Select
          inputId="federated-credential-audience"
          className="width-30"
          value={AUDIENCE_OPTIONS.find((opt) => opt.value === credentials.federatedCredentialAudience)}
          options={AUDIENCE_OPTIONS}
          onChange={onAudienceChange}
          isDisabled={disabled}
        />
      </Field>
    </>
  );
};

export default FederatedIdentityCredentials;

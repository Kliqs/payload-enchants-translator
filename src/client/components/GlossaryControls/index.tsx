'use client';

import { Button, toast, useConfig, useTranslation } from '@payloadcms/ui';
import { useState } from 'react';

import { translatorT } from '../../../i18n-translations';

export const GlossaryControls = ({ basePath }: { basePath: string }) => {
  const { config } = useConfig();

  const { i18n, t } = useTranslation();

  const [syncing, setSyncing] = useState(false);

  const sync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(
        `${config.serverURL}${basePath}${config.routes.api}/translator/glossary/sync`,
        { credentials: 'include', headers: { 'Accept-Language': i18n.language }, method: 'POST' },
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || translatorT(t, 'glossary_syncError'));

        return;
      }
      toast.success(translatorT(t, 'glossary_syncSuccess'));
    } catch {
      toast.error(translatorT(t, 'glossary_syncError'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      disabled={syncing}
      margin={false}
      onClick={sync}
      size='small'
      tooltip={translatorT(t, 'glossary_syncHint')}
      type='button'
    >
      {translatorT(t, syncing ? 'glossary_syncing' : 'glossary_syncAll')}
    </Button>
  );
};

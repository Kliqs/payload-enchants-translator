'use client';

import './styles.scss';

import { PublishButton, SaveButton, useConfig, useDocumentInfo, useLocale } from '@payloadcms/ui';

import type { TranslateResolver } from '../../../resolvers/types';
import { TranslatorProvider } from '../../providers/Translator/TranslatorProvider';
import { ResolverButton } from '../ResolverButton';
import { TranslatorModal } from '../TranslatorModal';

export const CustomButtonWithTranslator = ({ type, disabledLocales }: { type: 'publish' | 'save', disabledLocales: string[] }) => {
  const { config } = useConfig();
  const locale = useLocale();

  const DefaultButton = type === 'publish' ? PublishButton : SaveButton;

  const { globalSlug, id } = useDocumentInfo();

  const resolvers = (config.admin?.custom?.translator?.resolvers as TranslateResolver[]) ?? [];

  if (!id && !globalSlug) return <DefaultButton />;

  if(disabledLocales.includes(locale.code)) return <DefaultButton />;

  return (
    <TranslatorProvider>
      <div className={'translator__custom-save-button'}>
        <TranslatorModal disabledLocales={disabledLocales} />
        {resolvers.map((resolver) => (
          <ResolverButton key={resolver.key} resolver={resolver} />
        ))}
        {<DefaultButton />}
      </div>
    </TranslatorProvider>
  );
};

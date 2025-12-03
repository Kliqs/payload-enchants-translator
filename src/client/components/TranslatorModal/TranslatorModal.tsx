import './styles.scss';

import { Modal } from '@payloadcms/ui';

import { useTranslator } from '../../providers/Translator/context';
import { Content } from './Content';

export const TranslatorModal = ({disabledLocales}:{disabledLocales:string[]}) => {
  const { closeTranslator, modalSlug, resolver } = useTranslator();

  if (!resolver) return;

  return (
    <Modal className={'translator__modal'} slug={modalSlug}>
      <div className={'translator__wrapper'}>
        <button aria-label='Close' className={'translator__close'} onClick={closeTranslator} />
        <Content disabledLocales={disabledLocales} />
      </div>
    </Modal>
  );
};

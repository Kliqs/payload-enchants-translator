import type { CustomPublishButton, CustomSaveButton } from 'payload';

export const CustomButton = (type: 'publish' | 'save', disabledLocales?: string[]): CustomPublishButton | CustomSaveButton => {
  return {
    clientProps: {
      disabledLocales: disabledLocales || [],
      type,
    },
    path: '@extravirgin/payload-enchants-translator/client#CustomButtonWithTranslator',
  };
};

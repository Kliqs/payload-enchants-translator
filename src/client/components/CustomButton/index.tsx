import type { CustomPublishButton, CustomSaveButton } from 'payload';

export const CustomButton = (type: 'publish' | 'save', disabledLocales?: string[]): CustomPublishButton | CustomSaveButton => {
  return {
    clientProps: {
      type,
      disabledLocales: disabledLocales || [],
    },
    path: '@extravirgin/payload-enchants-translator/client#CustomButtonWithTranslator',
  };
};

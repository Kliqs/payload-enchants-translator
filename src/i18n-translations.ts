import type { TFunction } from '@payloadcms/translations';

export const translations = {
  de: {
    'plugin-translator': {
      error_badRequest: 'Ungültige Übersetzungsanfrage.',
      error_jsonRequired: 'Die Anfrage muss JSON enthalten.',
      error_missingLocalization:
        'Die Lokalisierung muss konfiguriert sein, um den Übersetzer zu verwenden.',
      error_missingResolver: 'Der Übersetzungsanbieter {{resolver}} wurde nicht gefunden.',
      glossary_accessDenied: 'Vollständiger Zugriff auf das Glossar ist erforderlich.',
      glossary_distinctLanguages:
        'Jede Zielsprache des Glossars muss einer eigenen DeepL-Sprache zugeordnet sein.',
      glossary_duplicateSource: 'Ausgangsbegriffe im Glossar müssen eindeutig sein.',
      glossary_empty: 'Fügen Sie mindestens einen Glossareintrag hinzu.',
      glossary_invalidTerm:
        'Jeder ausgefüllte Begriff muss einzeilig sein. {{locale}} ist erforderlich.',
      glossary_missingID:
        'Konfigurieren Sie die DeepL-Glossar-ID vor dem Synchronisieren oder Übersetzen.',
      glossary_missingResolver: 'Der DeepL-Glossaranbieter ist nicht konfiguriert.',
      glossary_plural: 'Übersetzungsglossar',
      glossary_saveError:
        'Die DeepL-Synchronisierung ist fehlgeschlagen. Speichern Sie erneut oder synchronisieren Sie das gesamte Glossar.',
      glossary_singular: 'Glossareintrag',
      glossary_syncAll: 'Alles mit DeepL synchronisieren',
      glossary_syncError:
        'Die Synchronisierung des Glossars ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
      glossary_syncHint:
        'Synchronisieren Sie alles, nachdem Sie Ausgangsbegriffe umbenannt, Übersetzungen geleert oder Einträge gelöscht haben.',
      glossary_syncSuccess: 'Das Glossar wurde mit DeepL synchronisiert.',
      glossary_syncing: 'Wird synchronisiert…',
      glossary_termTooLong: 'Jeder Glossarbegriff darf höchstens 1024 UTF-8-Bytes umfassen.',
      glossary_tooLarge: 'Das Glossar überschreitet die DeepL-Grenze von 10 MiB.',
      resolver_copy_buttonLabel: 'Aus anderer Sprache kopieren',
      resolver_copy_errorMessage: 'Beim Verarbeiten der Daten ist ein Fehler aufgetreten.',
      resolver_copy_modalTitle: 'Wählen Sie die Sprache aus, aus der kopiert werden soll.',
      resolver_copy_submitButtonLabelEmpty: 'Nur leere Felder kopieren',
      resolver_copy_submitButtonLabelFull: 'Alles kopieren',
      resolver_copy_successMessage:
        'Erfolgreich kopiert. Klicken Sie auf „Speichern“, um die Änderungen zu übernehmen.',
      resolver_deepl_buttonLabel: 'Mit DeepL übersetzen',
      resolver_deepl_errorMessage: 'Beim Verarbeiten der Daten ist ein Fehler aufgetreten.',
      resolver_deepl_modalTitle: 'Wählen Sie die Sprache aus, aus der übersetzt werden soll.',
      resolver_deepl_submitButtonLabelEmpty: 'Nur leere Felder übersetzen',
      resolver_deepl_submitButtonLabelFull: 'Alles übersetzen',
      resolver_deepl_successMessage:
        'Erfolgreich übersetzt. Klicken Sie auf „Speichern“, um die Änderungen zu übernehmen.',
      resolver_google_buttonLabel: 'Google Translate',
      resolver_google_errorMessage: 'Beim Verarbeiten der Daten ist ein Fehler aufgetreten.',
      resolver_google_modalTitle: 'Wählen Sie die Sprache aus, aus der übersetzt werden soll.',
      resolver_google_submitButtonLabelEmpty: 'Nur leere Felder übersetzen',
      resolver_google_submitButtonLabelFull: 'Alles übersetzen',
      resolver_google_successMessage:
        'Erfolgreich übersetzt. Klicken Sie auf „Speichern“, um die Änderungen zu übernehmen.',
      resolver_libre_buttonLabel: 'Libre Translate',
      resolver_libre_errorMessage: 'Beim Verarbeiten der Daten ist ein Fehler aufgetreten.',
      resolver_libre_modalTitle: 'Wählen Sie die Sprache aus, aus der übersetzt werden soll.',
      resolver_libre_submitButtonLabelEmpty: 'Nur leere Felder übersetzen',
      resolver_libre_submitButtonLabelFull: 'Alles übersetzen',
      resolver_libre_successMessage:
        'Erfolgreich übersetzt. Klicken Sie auf „Speichern“, um die Änderungen zu übernehmen.',
      resolver_openai_buttonLabel: 'KI-Übersetzung',
      resolver_openai_errorMessage: 'Beim Verarbeiten der Daten ist ein Fehler aufgetreten.',
      resolver_openai_modalTitle: 'Wählen Sie die Sprache aus, aus der übersetzt werden soll.',
      resolver_openai_submitButtonLabelEmpty: 'Nur leere Felder übersetzen',
      resolver_openai_submitButtonLabelFull: 'Alles übersetzen',
      resolver_openai_successMessage:
        'Erfolgreich übersetzt. Klicken Sie auf „Speichern“, um die Änderungen zu übernehmen.',
    },
  },
  en: {
    'plugin-translator': {
      error_badRequest: 'Invalid translation request.',
      error_jsonRequired: 'The request must contain JSON.',
      error_missingLocalization: 'Localization must be configured to use the translator.',
      error_missingResolver: 'The translation provider {{resolver}} was not found.',
      glossary_accessDenied: 'Full glossary access is required.',
      glossary_distinctLanguages: 'Each glossary target must map to a distinct DeepL language.',
      glossary_duplicateSource: 'Source glossary terms must be unique.',
      glossary_empty: 'Add at least one glossary entry.',
      glossary_invalidTerm: 'Each supplied term must be single-line, and {{locale}} is required.',
      glossary_missingID: 'Configure the DeepL glossary ID before syncing or translating.',
      glossary_missingResolver: 'The DeepL glossary resolver is not configured.',
      glossary_plural: 'Translation Glossary',
      glossary_saveError: 'DeepL synchronization failed. Please retry saving or use Sync all.',
      glossary_singular: 'Glossary Entry',
      glossary_syncAll: 'Sync all to DeepL',
      glossary_syncError: 'Glossary synchronization failed. Please try again.',
      glossary_syncHint:
        'Use Sync all after renaming source terms, clearing translations, or deleting entries.',
      glossary_syncSuccess: 'Glossary synchronized to DeepL.',
      glossary_syncing: 'Syncing…',
      glossary_termTooLong: 'Each glossary term must fit within 1024 UTF-8 bytes.',
      glossary_tooLarge: 'The glossary exceeds the DeepL 10 MiB limit.',
      resolver_copy_buttonLabel: 'Copy from other locale',
      resolver_copy_errorMessage: 'An error occurred when trying to translate the data',
      resolver_copy_modalTitle: 'Choose the locale to copy from',
      resolver_copy_submitButtonLabelEmpty: 'Copy only empty fields',
      resolver_copy_submitButtonLabelFull: 'Copy all',
      resolver_copy_successMessage: 'Successfully copied. Press "Save" to apply the changes.',
      resolver_deepl_buttonLabel: 'Translate with DeepL',
      resolver_deepl_errorMessage: 'An error occurred when trying to translate the data',
      resolver_deepl_modalTitle: 'Choose the locale to translate from',
      resolver_deepl_submitButtonLabelEmpty: 'Translate only empty fields',
      resolver_deepl_submitButtonLabelFull: 'Translate all',
      resolver_deepl_successMessage: 'Successfully translated. Press "Save" to apply the changes.',

      resolver_google_buttonLabel: 'Google Translate',
      resolver_google_errorMessage: 'An error occurred when trying to translate the data',
      resolver_google_modalTitle: 'Choose the locale to translate from',
      resolver_google_submitButtonLabelEmpty: 'Translate only empty fields',
      resolver_google_submitButtonLabelFull: 'Translate all',
      resolver_google_successMessage: 'Successfully translated. Press "Save" to apply the changes.',

      resolver_libre_buttonLabel: 'Libre Translate',
      resolver_libre_errorMessage: 'An error occurred when trying to translate the data',
      resolver_libre_modalTitle: 'Choose the locale to translate from',
      resolver_libre_submitButtonLabelEmpty: 'Translate only empty fields',
      resolver_libre_submitButtonLabelFull: 'Translate all',
      resolver_libre_successMessage: 'Successfully translated. Press "Save" to apply the changes.',

      resolver_openai_buttonLabel: 'AI Translate',
      resolver_openai_errorMessage: 'An error occurred when trying to translate the data',
      resolver_openai_modalTitle: 'Choose the locale to translate from',
      resolver_openai_submitButtonLabelEmpty: 'Translate only empty fields',
      resolver_openai_submitButtonLabelFull: 'Translate all',
      resolver_openai_successMessage: 'Successfully translated. Press "Save" to apply the changes.',
    },
  },
  uk: {
    'plugin-translator': {
      resolver_copy_buttonLabel: 'Копіювати з іншої локалі',
      resolver_copy_errorMessage: 'Сталася помилка під час спроби перекладу даних',
      resolver_copy_modalTitle: 'Виберіть локаль для копіювання',
      resolver_copy_submitButtonLabelEmpty: 'Копіювати лише порожні поля',
      resolver_copy_submitButtonLabelFull: 'Копіювати все',
      resolver_copy_successMessage:
        'Успішно скопійовано. Натисніть "Зберегти", щоб застосувати зміни.',

      resolver_google_buttonLabel: 'Переклад Google',
      resolver_google_errorMessage: 'Сталася помилка під час спроби перекладу даних',
      resolver_google_modalTitle: 'Виберіть локаль для перекладу',
      resolver_google_submitButtonLabelEmpty: 'Перекласти лише порожні поля',
      resolver_google_submitButtonLabelFull: 'Перекласти все',
      resolver_google_successMessage:
        'Успішно перекладено. Натисніть "Зберегти", щоб застосувати зміни.',

      resolver_libre_buttonLabel: 'Переклад Libre',
      resolver_libre_errorMessage: 'Сталася помилка під час спроби перекладу даних',
      resolver_libre_modalTitle: 'Виберіть локаль для перекладу',
      resolver_libre_submitButtonLabelEmpty: 'Перекласти лише порожні поля',
      resolver_libre_submitButtonLabelFull: 'Перекласти все',
      resolver_libre_successMessage:
        'Успішно перекладено. Натисніть "Зберегти", щоб застосувати зміни.',

      resolver_openai_buttonLabel: 'Переклад AI',
      resolver_openai_errorMessage: 'Сталася помилка під час спроби перекладу даних',
      resolver_openai_modalTitle: 'Виберіть локаль для перекладу',
      resolver_openai_submitButtonLabelEmpty: 'Перекласти лише порожні поля',
      resolver_openai_submitButtonLabelFull: 'Перекласти все',
      resolver_openai_successMessage:
        'Успішно перекладено. Натисніть "Зберегти", щоб застосувати зміни.',
    },
  },
  zh: {
    'plugin-translator': {
      resolver_copy_buttonLabel: '从其他语言复制',
      resolver_copy_errorMessage: '尝试翻译数据时发生错误',
      resolver_copy_modalTitle: '选择要复制的语言',
      resolver_copy_submitButtonLabelEmpty: '仅复制空字段',
      resolver_copy_submitButtonLabelFull: '复制全部',
      resolver_copy_successMessage: '复制成功。按下“保存”以应用更改。',

      resolver_google_buttonLabel: '谷歌翻译',
      resolver_google_errorMessage: '尝试翻译数据时发生错误',
      resolver_google_modalTitle: '选择要翻译的语言',
      resolver_google_submitButtonLabelEmpty: '仅翻译空字段',
      resolver_google_submitButtonLabelFull: '翻译全部',
      resolver_google_successMessage: '翻译成功。按下“保存”以应用更改。',

      resolver_libre_buttonLabel: '自由翻译',
      resolver_libre_errorMessage: '尝试翻译数据时发生错误',
      resolver_libre_modalTitle: '选择要翻译的语言',
      resolver_libre_submitButtonLabelEmpty: '仅翻译空字段',
      resolver_libre_submitButtonLabelFull: '翻译全部',
      resolver_libre_successMessage: '翻译成功。按下“保存”以应用更改。',

      resolver_openai_buttonLabel: 'AI翻译',
      resolver_openai_errorMessage: '尝试翻译数据时发生错误',
      resolver_openai_modalTitle: '选择要翻译的语言',
      resolver_openai_submitButtonLabelEmpty: '仅翻译空字段',
      resolver_openai_submitButtonLabelFull: '翻译全部',
      resolver_openai_successMessage: '翻译成功。按下“保存”以应用更改。',
    },
  },
};

export const translatorT = <TKey extends string>(
  t: TFunction<TKey> | undefined,
  key: keyof (typeof translations.en)['plugin-translator'],
  options?: Record<string, string>,
): string =>
  t
    ? t(`plugin-translator:${key}` as TKey, options)
    : translations.en['plugin-translator'][key].replace(
        /{{(\w+)}}/g,
        (_, name: string) => options?.[name] ?? '',
      );

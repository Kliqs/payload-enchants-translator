import type { CollectionSlug, GlobalSlug } from 'payload';

import type { GlossaryConfig } from './glossary';
import type { TranslateResolver } from './resolvers/types';

export type TranslatorConfig = {
  /**
   * Optional base path for the translator API endpoint
   */
  basePath?: string;
  /**
   * Collections with the enabled translator in the admin UI
   */
  collections: CollectionSlug[];
  /**
   * Disable the plugin
   */
  disabled?: boolean;
  /**
   * Locales that should be excluded from translation (source and target)
   */
  disabledLocales?: string[];
  /**
   * Globals with the enabled translator in the admin UI
   */
  globals: GlobalSlug[];
  glossary?: GlossaryConfig;
  /**
   * Add resolvers that you want to include, examples on how to write your own in ./plugin/src/resolvers
   */
  resolvers: TranslateResolver[];
};

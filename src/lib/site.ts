// Single source of truth for site-wide identity strings (site name, RSS
// titles and descriptions, default <meta name="description">). Lifting
// these out of individual components/pages means renaming the site is a
// one-file change.
import type { Lang } from './posts';

export const SITE_NAME = 'garaemon';

export const RSS_TITLE_BY_LANG: Record<Lang, string> = {
  ja: SITE_NAME,
  en: `${SITE_NAME} (English)`,
};

// TODO: replace JA with a real Japanese description once finalised.
// Both DEFAULT_DESCRIPTION_BY_LANG and RSS feed description currently
// fall back to the English string for JA so the JA meta does not
// appear empty before a localised description ships.
export const DEFAULT_DESCRIPTION_BY_LANG: Record<Lang, string> = {
  ja: 'A machine that consumes pop culture and outputs code.',
  en: 'A machine that consumes pop culture and outputs code.',
};

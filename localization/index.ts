import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

import { en } from './en';
import { bg } from './bg';

// Type for the language strings
export type LocalizationStrings = typeof en;

// Define the resources object for i18next
const resources = {
  en: {
    translation: en
  },
  bg: {
    translation: bg
  }
  // Add more languages here as needed
};

// Get the best available language from the device
// Using getLocales() which is the non-deprecated approach
const deviceLanguage = Localization.getLocales?.()?.[0]?.languageCode || 'en';

// Check if the language is RTL
const isRTL = I18nManager.isRTL;

// Update layout direction
I18nManager.forceRTL(isRTL);

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

/**
 * Set the current language for the app
 * @param lang Language code
 */
export const setLanguage = (lang: string) => {
  if (Object.keys(resources).includes(lang)) {
    i18n.changeLanguage(lang);
  } else {
    console.warn(`Language ${lang} not found, using fallback language`);
    i18n.changeLanguage('en');
  }
};

/**
 * Get localized string by key path
 * @param keyPath Dot notation path to the string (e.g., 'pageTitle.home')
 * @returns The localized string or the key path if not found
 */
export const t = (keyPath: string): string => {
  return i18n.t(keyPath);
};

// Get the current locale
export const getCurrentLocale = (): string => i18n.language;

// Check if the current locale is RTL
export const getIsRTL = (): boolean => I18nManager.isRTL;

// Get all available locales
export const getAvailableLocales = (): string[] => Object.keys(resources);

// Export the hook for functional components
export const useAppTranslation = () => useTranslation();

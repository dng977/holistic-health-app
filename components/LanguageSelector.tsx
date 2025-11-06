import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTranslation, getCurrentLocale, getAvailableLocales, setLanguage } from '../localization';

interface LanguageSelectorProps {
  onLanguageChange?: () => void;
}

export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  // Use the translation hook
  const { i18n } = useAppTranslation();
  const currentLocale = getCurrentLocale();
  const availableLocales = getAvailableLocales();

  const handleLanguageChange = (locale: string) => {
    setLanguage(locale);
    if (onLanguageChange) {
      onLanguageChange();
    }
  };

  return (
    <View style={styles.container}>
      {availableLocales.map((locale) => (
        <TouchableOpacity
          key={locale}
          style={[
            styles.languageButton,
            currentLocale === locale && styles.activeLanguage,
          ]}
          onPress={() => handleLanguageChange(locale)}
        >
          <Text
            style={[
              styles.languageText,
              currentLocale === locale && styles.activeLanguageText,
            ]}
          >
            {locale.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  activeLanguage: {
    backgroundColor: '#2196F3',
  },
  languageText: {
    fontSize: 14,
    color: '#212121',
  },
  activeLanguageText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

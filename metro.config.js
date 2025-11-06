// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for WASM files and SQLite
config.resolver.assetExts.push('wasm');
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Handle SQLite web worker issues
config.resolver.alias = {
  ...config.resolver.alias,
  'wa-sqlite': path.resolve(__dirname, 'node_modules/wa-sqlite'),
};

// Add resolver for WASM files
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = withNativeWind(config, { input: './global.css' });

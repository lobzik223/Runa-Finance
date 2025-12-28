const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Включаем транспиляцию для react-native
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Включаем транспиляцию для всех модулей
  unstable_allowRequireContext: true,
};

// Настраиваем resolver - разрешаем транспиляцию react-native
config.resolver = {
  ...config.resolver,
  // Не блокируем react-native
  blockList: [],
  // Включаем транспиляцию для react-native
  unstable_enablePackageExports: true,
};

module.exports = config;

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Кастомный transformer для транспиляции react-native
const originalTransformer = config.transformer;

config.transformer = {
  ...originalTransformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Используем кастомный transformer
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  // Включаем транспиляцию для всех модулей
  unstable_allowRequireContext: true,
};

// Настраиваем resolver - явно указываем транспиляцию react-native
config.resolver = {
  ...config.resolver,
  // Не блокируем react-native
  blockList: [],
  // Включаем транспиляцию для react-native
  unstable_enablePackageExports: true,
  // Явно указываем, что react-native должен транспилироваться
  sourceExts: [...config.resolver.sourceExts],
};

// Настраиваем serializer
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [],
};

// Переопределяем функцию shouldTransform для транспиляции react-native
const originalShouldTransform = config.transformer.shouldTransform;
if (originalShouldTransform) {
  config.transformer.shouldTransform = (filePath) => {
    // Транспилируем react-native из node_modules
    if (filePath.includes('node_modules/react-native')) {
      return true;
    }
    return originalShouldTransform(filePath);
  };
}

module.exports = config;

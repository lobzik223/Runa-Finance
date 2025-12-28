const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Включаем транспиляцию для react-native из node_modules
// Это необходимо, так как React Native 0.81.5 использует приватные методы
config.transformer = {
  ...config.transformer,
  // Явно указываем, что нужно транспилировать react-native
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Настраиваем resolver для транспиляции react-native
config.resolver = {
  ...config.resolver,
  // Не блокируем react-native
  blockList: [],
};

module.exports = config;

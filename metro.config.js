const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Включаем транспиляцию для react-native из node_modules
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  unstable_allowRequireContext: true,
};

// Настраиваем resolver для транспиляции react-native
config.resolver = {
  ...config.resolver,
  blockList: [],
  unstable_enablePackageExports: true,
};

module.exports = config;

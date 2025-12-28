module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // Явно включаем поддержку приватных методов
          native: {
            unstable_transformProfile: 'default',
          },
        },
      ],
    ],
    plugins: [
      [
        '@babel/plugin-transform-class-properties',
        { loose: true },
      ],
      [
        '@babel/plugin-transform-private-methods',
        { loose: true },
      ],
      [
        '@babel/plugin-transform-private-property-in-object',
        { loose: true },
      ],
      // react-native-reanimated должен быть последним
      'react-native-reanimated/plugin',
    ],
  };
};

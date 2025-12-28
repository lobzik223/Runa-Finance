module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
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
    // Применяем плагины ко всем файлам, включая node_modules/react-native
    overrides: [
      {
        test: /node_modules[\\/]react-native[\\/]/,
        plugins: [
          '@babel/plugin-transform-class-properties',
          '@babel/plugin-transform-private-methods',
          '@babel/plugin-transform-private-property-in-object',
        ],
      },
    ],
  };
};

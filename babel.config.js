module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@babel/plugin-transform-class-properties',
        {
          loose: true,
        },
      ],
      [
        '@babel/plugin-transform-private-methods',
        {
          loose: true,
        },
      ],
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          '@babel/plugin-transform-class-properties',
          '@babel/plugin-transform-private-methods',
          'react-native-reanimated/plugin',
        ],
      },
    },
  };
};


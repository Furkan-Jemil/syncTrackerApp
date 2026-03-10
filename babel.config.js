module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      // Path alias resolution
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/stores': './src/stores',
            '@/hooks': './src/hooks',
            '@/api': './src/api',
            '@/lib': './src/lib',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/providers': './src/providers',
            '@/navigation': './src/navigation',
          },
        },
      ],
      // Reanimated must always be last
      'react-native-reanimated/plugin',
    ],
  };
};

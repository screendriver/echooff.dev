module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    'babel-preset-gatsby',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};

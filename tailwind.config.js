const { colors } = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    colors: {
      ...colors,
      echooff: {
        black: '#121d1f',
      },
    },
    width: {
      'px-60': '60px',
      'px-80': '80px',
    },
  },
};

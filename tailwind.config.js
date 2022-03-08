module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        letterSpacing: {
            widest: '.25em',
        },
        extend: {
            borderWidth: {
                3: '3px',
            },
            fontFamily: {
                'jetbrains-mono': '"JetBrains Mono"',
            },
            margin: {
                '1/12': '8.333333%',
            },
        },
    },
    plugins: [require('tailwind-dracula')('dracula')],
};

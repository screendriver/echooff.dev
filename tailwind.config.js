module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                'jetbrains-mono': '"JetBrains Mono"',
            },
        },
    },
    plugins: [require('tailwind-dracula')('dracula')],
};

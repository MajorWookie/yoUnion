module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // Expo Router transforms
            'expo-router/babel',
            // Resolve `@/` imports using Babel instead of Metro aliases
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@': './',
                    },
                    extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
                },
            ],
            // MUST be last
            ['react-native-reanimated/plugin', { relativeSourceLocation: true }],
        ],
    }
}



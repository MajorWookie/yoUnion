module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
        plugins: [
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



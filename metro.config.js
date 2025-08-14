const { getDefaultConfig } = require('expo/metro-config')
const { withTamagui } = require('@tamagui/metro-plugin')

const config = getDefaultConfig(__dirname)

// Tamagui configuration
const tamaguiConfig = withTamagui(config, {
    components: ['tamagui'],
    config: './tamagui.config.ts',
    outputCSS: './tamagui-web.css',
})

// Performance optimizations
tamaguiConfig.transformer = {
    ...tamaguiConfig.transformer,
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
        ecma: 8,
        keep_fnames: true,
        mangle: {
            keep_fnames: true,
        },
        compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        output: {
            ascii_only: true,
            quote_style: 3,
            wrap_iife: true,
        },
    },
    optimizationSizeLimit: 250000,
    getTransformOptions: async () => ({
        transform: {
            experimentalImportSupport: false,
            inlineRequires: true,
        },
    }),
}

// Cache configuration for faster builds
tamaguiConfig.cacheStores = [
    {
        store: require('metro-cache'),
        options: {
            maxWorkers: 4,
        },
    },
]

// Resolver configuration
tamaguiConfig.resolver = {
    ...tamaguiConfig.resolver,
    // Source extensions
    sourceExts: [...tamaguiConfig.resolver.sourceExts, 'mjs'],
    // Asset extensions
    assetExts: tamaguiConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    // Node modules to keep during bundling (for React Native)
    extraNodeModules: {
        ...tamaguiConfig.resolver.extraNodeModules,
    },
}

// Watcher configuration for better performance
tamaguiConfig.watchFolders = [
    ...tamaguiConfig.watchFolders || [],
]

// Server configuration
tamaguiConfig.server = {
    ...tamaguiConfig.server,
    enhanceMiddleware: (middleware, server) => {
        // Add custom middleware if needed
        return middleware
    },
}

// Serializer configuration for bundle optimization
tamaguiConfig.serializer = {
    ...tamaguiConfig.serializer,
    getModulesRunBeforeMainModule: () => [
        require.resolve('react-native/Libraries/Core/InitializeCore'),
    ],
    getPolyfills: () => require('react-native/rn-get-polyfills')(),
}

module.exports = tamaguiConfig
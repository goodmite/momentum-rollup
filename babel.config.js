module.exports = (api) => {
    api.cache(api.env('development'));

    const presets = [
        ['@babel/preset-env', {
            modules: false,
            useBuiltIns: false,
            forceAllTransforms: true,
        }],
    ];

    const plugins = [
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-object-rest-spread',
        ["@babel/plugin-transform-runtime",
            {
                "regenerator": true
            }
        ]
    ];

    return {
        presets,
        plugins,
    };
};

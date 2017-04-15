module.exports = {
    entry: './src/index.js',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                options: {
                    presets: ['es2015']
                }
            },
        ],
    },
    output: {
        filename: 'dist/build.js'
    }
};

const webpack = require('webpack');

module.exports = {
  outputDir: 'dist',

  transpileDependencies: [
    /@fullcalendar.*$/,
    'quasar'
  ],

  devServer: {
    historyApiFallback: true,  // This is important for history mode routing
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5005',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    },
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(true)
      })
    ]
  },

  publicPath: './'
};

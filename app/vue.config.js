/* eslint-disable */
const webpack = require('webpack');

module.exports = {
  outputDir: 'dist',

  transpileDependencies: [
    /@fullcalendar.*$/,
    'quasar'
  ],

  devServer: {
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
      rtlSupport: true
    }
  },

  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/styles/global.scss";`
      }
    }
  },

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': JSON.stringify(true)
      })
    ]
  }
};

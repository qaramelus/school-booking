const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: [
    /@fullcalendar.*$/,
    'quasar'
  ],
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
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
});

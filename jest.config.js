module.exports = {
    testEnvironment: 'jsdom',
  
    transform: {
      '^.+\\.vue$': '@vue/vue3-jest',
      '^.+\\.jsx?$': 'babel-jest'
    },
  
    moduleFileExtensions: [
      'js',
      'jsx',
      'json',
      'vue'
    ],

    setupFilesAfterEnv: [
      '<rootDir>/tests/setup.js'
    ],
  

    collectCoverageFrom: [
      'src/**/*.{js,vue}',
      '!src/main.js', 
      '!**/node_modules/**'
    ],
  

    collectCoverage: true,
  
    coveragePathIgnorePatterns: [
      '/node_modules/',
      'src/plugins'
    ],
  
    coverageReporters: ['text', 'lcov']
  };
  
  
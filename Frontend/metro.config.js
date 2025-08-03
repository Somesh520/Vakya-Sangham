// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': __dirname,
  '@screens': `${__dirname}/screens`,
  '@navigators': `${__dirname}/navigators`,
};

module.exports = config;
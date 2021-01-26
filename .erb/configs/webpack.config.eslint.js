/* eslint import/no-unresolved: off, import/no-self-import: off */
require('../../node_modules/@babel/register');

module.exports = require('./webpack.config.renderer.dev.babel').default;

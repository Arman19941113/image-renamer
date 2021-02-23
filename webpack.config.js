// support WebStorm analysis
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
      modules: [path.join(__dirname, '../../src'), 'node_modules'],
      '@': path.join(__dirname, 'src/render'),
    },
  },
};


require('@rushstack/eslint-config/patch/modern-module-resolution');
const defaultEslintConfig = {
  extends: ['@microsoft/eslint-config-spfx/lib/profiles/react'],
  parserOptions: { tsconfigRootDir: __dirname }
};

const fs = require('fs');
const os = require('os');
const path = require('path');
const userEslintConfig = path.join(os.homedir(),'.spfx-eslintrc.js');
module.exports = (fs.existsSync(userEslintConfig))
  // user-defined config
  ? require(userEslintConfig).mergeEslintConfig(defaultEslintConfig)
  // Microsoft default esLintConfig
  : defaultEslintConfig;
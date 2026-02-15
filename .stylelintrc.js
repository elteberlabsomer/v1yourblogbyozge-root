module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recommended'
  ],
  rules: {
    // Airbnb tarzı CSS kuralları
    'indentation': 2,
    'string-quotes': 'single',
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'selector-combinator-space-after': 'always',
    'selector-attribute-quotes': 'always',
    'selector-attribute-operator-space-before': 'never',
    'selector-attribute-operator-space-after': 'never',
    'selector-attribute-brackets-space-inside': 'never',
    'declaration-block-trailing-semicolon': 'always',
    'declaration-colon-space-before': 'never',
    'declaration-colon-space-after': 'always',
    'number-leading-zero': 'always',
    'function-url-quotes': 'always',
    'comment-whitespace-inside': 'always',
    'rule-empty-line-before': ['always', {
      except: ['first-nested'],
      ignore: ['after-comment']
    }],
    'selector-pseudo-element-colon-notation': 'double',
    'selector-pseudo-class-parentheses-space-inside': 'never',
    'media-feature-range-operator-space-before': 'always',
    'media-feature-range-operator-space-after': 'always',
    'media-feature-parentheses-space-inside': 'never',
    'media-feature-colon-space-before': 'never',
    'media-feature-colon-space-after': 'always'
  }
};

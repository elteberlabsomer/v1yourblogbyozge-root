export default {
  extends: [
    'stylelint-config-standard',
  ],
  rules: {
    // Airbnb tarzı CSS kuralları (sadece desteklenen kurallar)
    'color-hex-length': 'short',
    'color-hex-case': 'lower',
    'string-quotes': 'single',
    'number-leading-zero': 'always',
    'function-url-quotes': 'always',
    'comment-whitespace-inside': 'always',
    'declaration-colon-space-after': 'always',
    'declaration-colon-space-before': 'never',
    'declaration-block-trailing-semicolon': 'always',
    'selector-attribute-quotes': 'always',
    'selector-pseudo-element-colon-notation': 'double',
    'selector-combinator-space-after': 'always',
    'selector-combinator-space-before': 'always',
    'media-feature-colon-space-after': 'always',
    'media-feature-colon-space-before': 'never',
    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment'],
      },
    ],
  },
};

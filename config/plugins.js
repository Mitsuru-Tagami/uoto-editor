export const plugins = [
    {
        name: 'Vertical Writing Plugin',
        className: 'VerticalWritingPlugin',
        path: '../plugins/vertical-writing-plugin/vertical-writing-plugin.js',
        cssPath: '../plugins/vertical-writing-plugin/vertical-writing-plugin.css',
        enabled: true,
    },
    {
        name: 'Kakuyomu Notation Plugin',
        className: 'KakuyomuNotationPlugin',
        path: '../plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js',
        cssPath: '../plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.css',
        enabled: true,
    },
    {
        name: 'Syntax Highlight Plugin',
        className: 'SyntaxHighlightPlugin',
        path: '../plugins/syntax-highlight-plugin/syntax-highlight-plugin.js',
        // このプラグインのCSSはPrism.js本体が管理するため、ここでは指定しません
        cssPath: null,
        enabled: true, // デフォルトで有効にしてみましょう
    }
];
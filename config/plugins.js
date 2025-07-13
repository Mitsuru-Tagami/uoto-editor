export const plugins = [
    {
        name: 'Plugin Manager',
        className: 'PluginManagerPlugin',
        path: '../plugins/plugin-manager/plugin-manager.js',
        cssPath: '../plugins/plugin-manager/plugin-manager.css',
        enabled: true,
        isCore: true,
        description: 'プラグインの有効/無効を管理します。',
    },
    {
        name: 'Vertical Writing Plugin',
        className: 'VerticalWritingPlugin',
        path: '../plugins/vertical-writing-plugin/vertical-writing-plugin.js',
        cssPath: '../plugins/vertical-writing-plugin/vertical-writing-plugin.css',
        enabled: true,
        description: 'エディタを縦書きモードに切り替えます。',
    },
    {
        name: 'Kakuyomu Notation Plugin',
        className: 'KakuyomuNotationPlugin',
        path: '../plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js',
        cssPath: '../plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.css',
        enabled: true,
        description: 'カクヨム記法をプレビューに反映します。',
    },
    {
        name: 'Syntax Highlight Plugin',
        className: 'SyntaxHighlightPlugin',
        path: '../plugins/syntax-highlight-plugin/syntax-highlight-plugin.js',
        cssPath: null,
        enabled: true,
        description: 'コードのシンタックスハイライトを有効にします。',
        uiElementId: 'toggle-sinha-btn',
    }
];
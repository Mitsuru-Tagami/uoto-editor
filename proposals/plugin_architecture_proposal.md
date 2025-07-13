# 魚兎エディタのプラグインアーキテクチャ

## 1. 基本方針

魚兎エディタのプラグインは、`index.html` から直接読み込まれるのではなく、外部の設定ファイル (`config/plugins.js`) によって一元管理されています。これにより、プラグインの有効・無効の切り替えや、全体の管理が容易になっています。

---

## 2. 具体的な仕組み

### 2.1. プラグイン設定ファイル (`config/plugins.js`)

読み込むプラグインのリストは、`config/plugins.js` ファイルで管理します。このファイルは、各プラグインの詳細な設定を持つオブジェクトの配列を `plugins` という名前でエクスポートします。

-   `name`: プラグインの名前（表示用）
-   `className`: プラグインのクラス名
-   `path`: プラグインのJavaScriptファイルのパス
-   `cssPath`: プラグインのCSSファイルのパス（オプション）
-   `enabled`: プラグインが有効かどうかを示すブール値
-   `isCore`: コアプラグインかどうかを示すブール値（プラグインマネージャーで管理対象外とする場合など）
-   `description`: プラグインの説明
-   `uiElementId`: プラグインに関連するUI要素のID（オプション）
-   `dependencies`: プラグインが依存するJavaScriptファイルのパスの配列（オプション）

```javascript
// config/plugins.js

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
        cssPath: '../plugins/syntax-highlight-plugin/prism.min.css',
        enabled: true,
        description: 'コードのシンタックスハイライトを有効にします。',
        uiElementId: 'toggle-sinha-btn',
        dependencies: [
            '../plugins/syntax-highlight-plugin/prism.min.js',
            '../plugins/syntax-highlight-plugin/prism-javascript.min.js'
        ]
    }
];
```

### 2.2. プラグインの読み込みと登録 (`js/main.js`)

プラグインの読み込みと登録は、`js/main.js` が担当します。`js/main.js` は `config/plugins.js` の設定と `localStorage` に保存されたユーザーの状態に基づいて、動的にプラグインをロードし、エディタに登録します。

1.  **プラグイン設定の読み込み:**
    `config/plugins.js` から `plugins` 配列を読み込みます。

2.  **LocalStorageからの状態適用:**
    `localStorage` に保存されているユーザーのプラグイン有効/無効状態を読み込み、`plugins` 配列の設定に適用します。

3.  **動的なロードと登録:**
    `plugins` 配列をループし、`enabled: true` となっているプラグインについて、そのJavaScriptファイルとCSSファイルを動的に読み込み、エディタに登録します。

```javascript
// js/main.js の一部

import { plugins } from '../config/plugins.js';

document.addEventListener('DOMContentLoaded', async () => {
    const editorInstance = new Editor({ /* ... options ... */ });

    // LocalStorageからプラグインの状態を読み込み、適用する
    const savedStates = JSON.parse(localStorage.getItem('uotoEditorPluginStates')) || {};
    plugins.forEach(pluginConfig => {
        if (savedStates[pluginConfig.name] !== undefined) {
            pluginConfig.enabled = savedStates[pluginConfig.name];
        }
    });

    // 動的にプラグインをロードして登録する
    for (const pluginConfig of plugins) {
        if (pluginConfig.enabled) {
            try {
                // CSSを動的に読み込み
                if (pluginConfig.cssPath) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = pluginConfig.cssPath;
                    document.head.appendChild(link);
                }

                // JavaScriptモジュールを動的にインポート
                if (pluginConfig.dependencies && pluginConfig.dependencies.length > 0) {
                    for (const depPath of pluginConfig.dependencies) {
                        const script = document.createElement('script');
                        script.src = depPath;
                        script.async = false;
                        document.head.appendChild(script);
                        await new Promise(resolve => script.onload = resolve);
                    }
                }

                const module = await import(pluginConfig.path);
                const PluginClass = module[pluginConfig.className];

                if (PluginClass) {
                    const pluginInstance = new PluginClass(editorInstance);
                    editorInstance.registerPlugin(pluginInstance);
                }
            } catch (error) {
                console.error(`Failed to load plugin: ${pluginConfig.name}`, error);
            }
        }
    }

    // ... その他の初期化処理 ...
});
```

### 2.3. プラグインのファイル構造

各プラグインは、自身の関連ファイル（JavaScript, CSS, 画像など）を一つのディレクトリにまとめて管理します。

```
uoto-editor/
└── plugins/
    ├── vertical-writing-plugin/
    │   ├── vertical-writing-plugin.js
    │   └── vertical-writing-plugin.css
    └── kakuyomu-notation-plugin/
        ├── kakuyomu-notation-plugin.js
        └── kakuyomu-notation-plugin.css
```

---

## 3. このアーキテクチャのメリット

-   **保守性の向上:** プラグインの有効・無効の切り替えが `config/plugins.js` の編集だけで完結します。
-   **見通しの良さ:** `index.html` は構造の定義に集中でき、プラグインが増えても複雑化しません。
-   **デバッグの容易化:** `config/plugins.js` でプラグインをコメントアウトするだけで、問題の切り分けが簡単になります。
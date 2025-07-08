## 魚兎エディタ プラグイン管理

このドキュメントでは、魚兎エディタのプラグインをどのように有効化・無効化するかについて説明します。

### 1. プラグインの有効化

プラグインをエディタで利用するには、以下のステップが必要です。

1.  **`config/plugins.js`を編集する:**
    `uoto_editor/config/plugins.js`ファイルを開き、有効にしたいプラグインのクラス名を`pluginList`配列に追加します。コメントアウトされている行の`//`を削除することで有効化できます。

    ```javascript
    export const pluginList = [
        'VerticalWritingPlugin', // 縦書きプラグイン
        // 'SyntaxHighlightPlugin', // シンタックスハイライトプラグイン (仮)
    ];
    ```

2.  **プラグインのJavaScriptファイルを読み込む:**
    `index.html`の`<head>`または`<body>`の適切な位置に、`<script>`タグを使用してプラグインのJavaScriptファイルを読み込みます。**`type="module"`で読み込む場合は、そのプラグインのクラスを`export`する必要があります。**

    ```html
    <script src="js/uoto-editor.js"></script>
    <script type="module" src="js/plugins/vertical-writing-plugin.js"></script> <!-- 有効化したいプラグインの例 -->
    ```

3.  **エディタインスタンスにプラグインを登録する:**
    `index.html`の`<script type="module">`ブロック内で、`plugins.js`から`pluginList`をインポートし、そのリストに基づいてプラグインを動的に登録します。プラグインのクラスは、事前に`import`しておくか、グローバルスコープに公開されている必要があります。

    ```javascript
    import { pluginList } from './config/plugins.js';
    import { VerticalWritingPlugin } from './js/plugins/vertical-writing-plugin.js'; // プラグインをインポート

    // 利用可能なプラグインのマップ
    const availablePlugins = {
        'VerticalWritingPlugin': VerticalWritingPlugin,
        // 他のプラグインもここに追加
    };

    document.addEventListener('DOMContentLoaded', () => {
        const editorInstance = new Editor({
            // ... エディタのオプション ...
        });

        // プラグインを動的に登録
        pluginList.forEach(pluginName => {
            if (availablePlugins[pluginName]) {
                const pluginInstance = new availablePlugins[pluginName](editorInstance);
                editorInstance.registerPlugin(pluginInstance);
            } else {
                console.warn(`Plugin ${pluginName} not found in availablePlugins map.`);
            }
        });
    });
    ```

### 2. プラグインの無効化

プラグインを一時的に無効にしたい場合は、`config/plugins.js`ファイルを編集し、無効にしたいプラグインの行の先頭に`//`を追加してコメントアウトします。

```javascript
export const pluginList = [
    'VerticalWritingPlugin', // 縦書きプラグイン
    // 'SyntaxHighlightPlugin', // シンタックスハイライトプラグイン (仮) - 無効化
];
```

プラグインのJavaScriptファイルの読み込みや、`index.html`でのプラグイン登録のコードをコメントアウトする必要はありません。`config/plugins.js`の変更だけで、プラグインの有効・無効が切り替わります。
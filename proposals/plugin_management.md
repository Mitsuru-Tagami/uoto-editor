## 魚兎エディタ プラグイン管理

このドキュメントでは、魚兎エディタのプラグインをどのように有効化・無効化するかについて説明します。

### 1. プラグインの有効化・無効化

プラグインの有効・無効は、`config/plugins.js` ファイルで一元管理します。

1.  **`config/plugins.js` を編集する:**
    `uoto_editor/config/plugins.js` ファイルを開きます。
    `pluginList` という配列の中に、有効にしたいプラグインの **クラス名** が文字列で列挙されています。

2.  **有効化する場合:**
    無効になっているプラグイン（行頭に `//` が付いているもの）があれば、その `//` を削除します。

3.  **無効化する場合:**
    有効になっているプラグインの行頭に `//` を追加して、その行をコメントアウトします。

**編集例:**
```javascript
// config/plugins.js

export const pluginList = [
    'VerticalWritingPlugin',    // 縦書きプラグイン（有効）
    'KakuyomuNotationPlugin', // カクヨム記法プラグイン（有効）
    // 'SyntaxHighlightPlugin', // シンタックスハイライトプラグイン（無効）
];
```
上の例では、`VerticalWritingPlugin` と `KakuyomuNotationPlugin` が有効になり、`SyntaxHighlightPlugin` は無効になります。

### 2. プラグイン利用の前提条件

`config/plugins.js` でプラグインを有効にするには、そのプラグインが `index.html` で正しく読み込まれている必要があります。

1.  **プラグインファイルの読み込み (`index.html`):**
    `index.html` の中で、利用したいプラグインのJavaScriptファイルが `<script type="module">` タグで読み込まれていることを確認してください。

    ```html
    <!-- プラグインのJSファイルを読み込む -->
    <script type="module" src="plugins/vertical-writing-plugin/vertical-writing-plugin.js"></script>
    <script type="module" src="plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js"></script>
    ```

2.  **プラグイン登録マップへの追加 (`index.html`):**
    同じく `index.html` の中の `<script type="module">` ブロックで、プラグインのクラスが `import` され、`availablePlugins` マップに追加されていることを確認してください。

    ```javascript
    // 利用するプラグインのクラスをインポート
    import { VerticalWritingPlugin } from './plugins/vertical-writing-plugin/vertical-writing-plugin.js';
    import { KakuyomuNotationPlugin } from './plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js';

    // 利用可能なプラグインのマップ
    const availablePlugins = {
        'VerticalWritingPlugin': VerticalWritingPlugin,
        'KakuyomuNotationPlugin': KakuyomuNotationPlugin,
        // 新しいプラグインはここに追加
    };
    ```

通常、新しいプラグインを追加する場合にのみ `index.html` の編集が必要になります。日常的な有効・無効の切り替えは `config/plugins.js` の編集だけで完結します。

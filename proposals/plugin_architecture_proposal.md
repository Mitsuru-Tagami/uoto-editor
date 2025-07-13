# 魚兎エディタのプラグインアーキテクチャ

## 1. 基本方針

魚兎エディタのプラグインは、`index.html` から直接読み込まれるのではなく、外部の設定ファイル (`config/plugins.js`) によって一元管理されています。これにより、プラグインの有効・無効の切り替えや、全体の管理が容易になっています。

---

## 2. 具体的な仕組み

### 2.1. プラグイン設定ファイル (`config/plugins.js`)

読み込むプラグインのリストは、`config/plugins.js` ファイルで管理します。

-   `pluginList` という配列に、有効にしたいプラグインの **クラス名** を文字列として列挙します。
-   このリストに追加したり、コメントアウトしたりするだけで、エディタで読み込むプラグインを制御できます。

```javascript
// config/plugins.js

export const pluginList = [
    'VerticalWritingPlugin',    // 縦書き機能
    'KakuyomuNotationPlugin', // カクヨム記法サポート
    // 'SyntaxHighlightPlugin', // シンタックスハイライト（現在は無効）
];
```

### 2.2. プラグインの読み込みと登録 (`index.html`)

`index.html` の末尾にある `<script type="module">` ブロックで、プラグインの読み込みと登録が行われます。

1.  **プラグインクラスのインポート:**
    まず、利用する可能性のある全てのプラグインのクラスを、個別に `import` します。

2.  **利用可能プラグインのマップ作成:**
    インポートしたプラグインクラスを、クラス名をキーとするマップ (`availablePlugins`) に格納します。

3.  **動的な登録処理:**
    `config/plugins.js` から `pluginList` を読み込み、そのリストに含まれる名前のプラグインだけを `availablePlugins` マップから探し出し、インスタンス化してエディタに登録します。

```html
<!-- index.html の一部 -->
<script type="module">
    // 1. 設定ファイルと、利用する可能性のあるプラグインをすべてインポート
    import { pluginList } from './config/plugins.js';
    import { VerticalWritingPlugin } from './plugins/vertical-writing-plugin/vertical-writing-plugin.js';
    import { KakuyomuNotationPlugin } from './plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js';

    // 2. 利用可能なプラグインのマップを作成
    const availablePlugins = {
        'VerticalWritingPlugin': VerticalWritingPlugin,
        'KakuyomuNotationPlugin': KakuyomuNotationPlugin,
        // 他のプラグインもここに追加
    };

    document.addEventListener('DOMContentLoaded', () => {
        const editorInstance = new Editor({ /* ... */ });

        // 3. 設定リストに基づき、プラグインを動的に登録
        pluginList.forEach(pluginName => {
            if (availablePlugins[pluginName]) {
                const pluginInstance = new availablePlugins[pluginName](editorInstance);
                editorInstance.registerPlugin(pluginInstance);
            } else {
                console.warn(`Plugin ${pluginName} not found.`);
            }
        });

        window.uotoEditor = editorInstance;
    });
</script>
```

### 2.3. プラグインのファイル構造

各プラグインは、自身の関連ファイル（JavaScript, CSS, 画像など）を一つのディレクトリにまとめて管理します。

```
uoto_editor/
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
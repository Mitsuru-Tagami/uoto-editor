## 魚兎エディタ プラグイン仕様書

このドキュメントは、魚兎エディタの機能を拡張するためのプラグインの作成方法と、エディタコアとの連携方法について説明します。

---

### 1. プラグインシステムの目的

魚兎エディタは、コア機能（テキストの入力・表示、基本的なイベント管理）に集中し、特定の機能（シンタックスハイライト、縦書きモードなど）は外部のJavaScriptライブラリやカスタムコードを使った「プラグイン」として提供します。これにより、エディタ本体のコードをシンプルに保ち、機能の追加・更新・削除を柔軟に行えるようにします。

### 2. プラグインの基本構造

プラグインは、通常、以下の構造を持つJavaScriptのクラスとして実装し、`export` する必要があります。

```javascript
// plugins/my-awesome-plugin/my-awesome-plugin.js

export class MyAwesomePlugin {
    /**
     * プラグインのコンストラクタ。
     * @param {Editor} editorInstance - このプラグインが登録されるエディタのインスタンス。
     */
    constructor(editorInstance) {
        this.editor = editorInstance; // エディタインスタンスを保持
        // プラグインの初期設定
    }

    /**
     * プラグインの初期化メソッド。
     * エディタに登録された際に、エディタの `registerPlugin` メソッドから自動的に呼び出されます。
     * ここでエディタのイベントを購読したり、初期表示の処理を行います。
     */
    init() {
        // 例: エディタのテキスト変更イベントを購読する
        this.editor.on('textChanged', (newText) => {
            console.log('Text changed:', newText.substring(0, 20) + '...');
        });

        console.log('MyAwesomePlugin initialized.');
    }

    // プラグインの具体的な機能メソッドをここに追加
    doSomething() {
        console.log('Doing something awesome!');
    }
}
```

### 3. エディタコア (`Editor`クラス) との連携

プラグインは、`Editor` クラスが提供するAPIを通じて、エディタの状態にアクセスしたり、エディタの動作に影響を与えたりします。

#### 3.1. プラグインの登録

プラグインの登録は `index.html` で行われます。詳細は `plugin_management.md` を参照してください。
`Editor` インスタンスの `registerPlugin` メソッドが内部で呼び出され、プラグインの `init` メソッドが実行されます。

#### 3.2. イベントシステム

エディタは、内部の状態変化をイベントとして発行します。プラグインはこれらのイベントを購読することで、エディタの動作に反応できます。

*   **`editor.on(eventName, callback)`**: 指定されたイベント名に対するリスナー（コールバック関数）を登録します。
*   **`editor.emit(eventName, data)`**: 指定されたイベント名でイベントを発行し、登録されている全てのリスナーを呼び出します。

**主要なイベント:**

*   `textChanged` (newText: string): エディタのテキスト内容が変更されたときに発行されます。
*   `modeChanged` (newMode: string): エディタの書き込みモード（`horizontal` または `vertical`）が変更されたときに発行されます。
*   `sinhaToggled` (isEnabled: boolean): シンハ（Syntax Highlight）の有効・無効が切り替わったときに発行されます。
*   （その他、必要に応じて追加されるイベント）

#### 3.3. エディタの状態へのアクセス

*   **`editor.getTextContent()`**: エディタの現在のテキストコンテンツ (`string`) を返します。
*   **`editor.getDisplayArea()`**: プレビュー表示などに利用できる `HTMLElement` を返します。
*   **`editor.getCurrentMode()`**: 現在の書き込みモード (`'horizontal'` または `'vertical'`) を返します。

### 4. プラグインの利用

プラグインの有効化・無効化は `config/plugins.js` で行い、実際の読み込みと登録は `index.html` で設定します。詳細な手順は `plugin_management.md` を参照してください。

**`index.html` での読み込みと登録の例:**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <!-- ... CSSなどの読み込み ... -->
    <link rel="stylesheet" href="css/uoto-editor.css">
    <link rel="stylesheet" href="plugins/vertical-writing-plugin/vertical-writing-plugin.css">
</head>
<body>
    <!-- ... エディタのHTML構造 ... -->

    <!-- コアスクリプト -->
    <script src="js/uoto-editor.js"></script>

    <!-- プラグインのスクリプト (type="module"で読み込む) -->
    <script type="module" src="plugins/vertical-writing-plugin/vertical-writing-plugin.js"></script>
    <script type="module" src="plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js"></script>

    <!-- プラグイン登録処理 -->
    <script type="module">
        import { pluginList } from './config/plugins.js';
        import { VerticalWritingPlugin } from './plugins/vertical-writing-plugin/vertical-writing-plugin.js';
        import { KakuyomuNotationPlugin } from './plugins/kakuyomu-notation-plugin/kakuyomu-notation-plugin.js';

        const availablePlugins = {
            'VerticalWritingPlugin': VerticalWritingPlugin,
            'KakuyomuNotationPlugin': KakuyomuNotationPlugin,
        };

        document.addEventListener('DOMContentLoaded', () => {
            const editorInstance = new Editor({ /* ... options ... */ });

            pluginList.forEach(pluginName => {
                if (availablePlugins[pluginName]) {
                    const pluginInstance = new availablePlugins[pluginName](editorInstance);
                    editorInstance.registerPlugin(pluginInstance);
                }
            });

            window.uotoEditor = editorInstance;
        });
    </script>
</body>
</html>
```

---

### 5. その他のプラグインアイデア

ここでは、魚兎エディタの機能をさらに豊かにする、単体では小さな機能だが、プラグインとして実装することで価値を提供するアイデアを列挙します。

#### 5.1. 文字数・行数カウントプラグイン

*   **目的:** 入力中のテキストの文字数、行数、段落数などをリアルタイムで表示します。
*   **実装のポイント:** `editor.on('textChanged', ...)` イベントを購読し、計算結果をUIに表示します。パフォーマンスを考慮し、デバウンス処理を導入すると良いでしょう。

#### 5.2. 自動保存・履歴管理プラグイン

*   **目的:** ユーザーの入力内容を自動で保存し、データ損失を防ぎます。
*   **実装のポイント:** `editor.on('textChanged', ...)` イベントを購読し、タイマーを使って定期的に `localStorage` にテキストを保存します。

#### 5.3. スペルチェック・校正プラグイン

*   **目的:** 文章の誤字脱字や文法ミスを指摘し、品質向上を支援します。
*   **実装のポイント:** 外部の校正ライブラリと連携し、`editor.on('textChanged', ...)` のタイミングでテキストを解析・ハイライトします。

#### 5.4. ファイルツリー・プロジェクト管理プラグイン

*   **目的:** エディタのUI内にファイルツリーを表示し、ファイル間の移動を容易にします。
*   **実装のポイント:** ブラウザのセキュリティ制約上、ローカルファイルへの直接アクセスは困難です。サーバー連携や、ユーザーがフォルダを選択するAPI (`showDirectoryPicker`) の利用を検討します。
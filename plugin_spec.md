## 魚兎エディタ プラグイン仕様書

このドキュメントは、魚兎エディタの機能を拡張するためのプラグインの作成方法と、エディタコアとの連携方法について説明します。

---

### 1. プラグインシステムの目的

魚兎エディタは、コア機能（テキストの入力・表示、基本的なイベント管理）に集中し、特定の機能（シンタックスハイライト、縦書きモードなど）は外部のJavaScriptライブラリやカスタムコードを使った「プラグイン」として提供します。これにより、エディタ本体のコードをシンプルに保ち、機能の追加・更新・削除を柔軟に行えるようにします。

### 2. プラグインの基本構造

プラグインは、通常、以下の構造を持つJavaScriptのクラスとして実装します。

```javascript
class MyAwesomePlugin {
    /**
     * プラグインのコンストラクタ。
     * 必要に応じて、エディタインスタンスや外部ライブラリなどを引数として受け取ります。
     * @param {Editor} editorInstance - このプラグインが登録されるエディタのインスタンス。
     * @param {Object} [options] - プラグイン固有のオプション。
     */
    constructor(editorInstance, options) {
        this.editor = editorInstance; // エディタインスタンスを保持
        this.options = options;      // オプションを保持
        // プラグインの初期設定
    }

    /**
     * プラグインの初期化メソッド。
     * エディタに登録された際に、エディタの `registerPlugin` メソッドから自動的に呼び出されます。
     * ここでエディタのイベントを購読したり、初期表示の処理を行います。
     * @param {Editor} editorInstance - エディタのインスタンス（`registerPlugin`から渡される）。
     */
    init(editorInstance) {
        // エディタインスタンスが渡されることを確認し、保持
        this.editor = editorInstance || this.editor;

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

### 3. エディタコア (Editorクラス) との連携

プラグインは、`Editor` クラスが提供する以下のAPIを通じて、エディタの状態にアクセスしたり、エディタの動作に影響を与えたりします。

#### 3.1. プラグインの登録

`Editor` インスタンスの `registerPlugin` メソッドを使用してプラグインを登録します。

```javascript
const editor = new Editor({ /* ... */ });
const myPlugin = new MyAwesomePlugin(editor, { /* options */ });
editor.registerPlugin(myPlugin);
```

#### 3.2. イベントシステム

エディタは、内部の状態変化をイベントとして発行します。プラグインはこれらのイベントを購読することで、エディタの動作に反応できます。

*   **`editor.on(eventName, callback)`**: 指定されたイベント名に対するリスナー（コールバック関数）を登録します。
    *   `eventName` (string): 購読するイベントの名前。
    *   `callback` (Function): イベント発生時に呼び出される関数。イベントに関連するデータが引数として渡されます。

*   **`editor.emit(eventName, data)`**: 指定されたイベント名でイベントを発行し、登録されている全てのリスナーを呼び出します。プラグインからエディタコアや他のプラグインに通知したい場合に使用できます。
    *   `eventName` (string): 発行するイベントの名前。
    *   `data` (*): イベントに関連するデータ。

**主要なイベント:**

*   `textChanged` (newText: string): エディタのテキスト内容が変更されたときに発行されます。
*   `scroll` (scrollInfo: { scrollTop: number, scrollLeft: number }): エディタのスクロール位置が変更されたときに発行されます。
*   `modeChanged` (newMode: string): エディタの書き込みモード（`horizontal` または `vertical`）が変更されたときに発行されます。
*   （その他、必要に応じて追加されるイベント）

#### 3.3. エディタの状態へのアクセス

*   **`editor.getTextContent()`**: エディタの現在のテキストコンテンツを返します。
    *   戻り値: `string`
*   **`editor.getDisplayArea()`**: ハイライト表示などのためのオーバーレイ要素（`HTMLElement`）を返します。プラグインがこの要素にコンテンツを挿入するために使用します。
    *   戻り値: `HTMLElement`
*   **`editor.getCurrentMode()`**: 現在の書き込みモード（`horizontal` または `vertical`）を返します。
    *   戻り値: `string`

#### 3.4. エディタの動作制御

*   **`editor.toggleWritingMode()`**: エディタの書き込みモードを切り替えます。このメソッドを呼び出すと、`modeChanged` イベントが発行されます。

### 4. プラグインの利用例（`index.html`での読み込み）

プラグインは、`config/plugins.js`で有効化され、`index.html`でコアの`uoto-editor.js`の後に読み込まれ、エディタインスタンスに登録されます。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <!-- ... 省略 ... -->
    <script src="js/uoto-editor.js"></script>
    <!-- プラグインのJavaScriptファイルを読み込む (type="module"でexportされている場合) -->
    <script type="module" src="js/plugins/vertical-writing-plugin.js"></script>
    <!-- 他のプラグインも同様に読み込む -->

    <script type="module">
        import { pluginList } from './config/plugins.js';
        import { VerticalWritingPlugin } from './js/plugins/vertical-writing-plugin.js'; // 有効化するプラグインをインポート
        // 他のプラグインもここに追加でインポート

        // 利用可能なプラグインのマップ
        const availablePlugins = {
            'VerticalWritingPlugin': VerticalWritingPlugin,
            // 他のプラグインもここに追加
        };

        document.addEventListener('DOMContentLoaded', () => {
            const editorInstance = new Editor({
                editorId: 'editor',
                previewId: 'preview',
                eofIndicatorId: 'eof-indicator',
                openBtnId: 'open-btn',
                saveBtnId: 'save-btn',
                fileInputId: 'file-input',
                searchInputId: 'search-input',
                replaceInputId: 'replace-input',
                findNextBtnId: 'find-next-btn',
                replaceBtnId: 'replace-btn',
                replaceAllBtnId: 'replace-all-btn',
                editorTitleId: 'editor-title'
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

            // グローバルアクセス用 (デバッグや将来のプラグインで必要になる場合)
            window.uotoEditor = editorInstance;
        });
    </script>
</body>
</html>

---

### 5. カクヨム記法レンダリングプラグインのアイデア

このプラグインは、エディタに入力されたカクヨム記法を解析し、HTMLとしてレンダリングしてプレビュー表示する機能を提供します。シンタックスハイライトとは異なり、テキストに特別な意味を持たせるための「マークアップ記法」の表示を目的とします。

#### 5.1. 目的と機能

*   エディタのテキストエリアに入力されたカクヨム記法（例: `《ルビ》`、`｜漢字《ルビ》`、`[[目次]]` など）をリアルタイムで解析します。
*   解析した記法を、ブラウザで表示可能なHTML形式に変換します（例: `<ruby><rb>漢字</rb><rt>ルビ</rt></ruby>`）。
*   変換されたHTMLを、エディタのプレビュー領域（または別の専用パネル）に表示し、ユーザーが入力内容の最終的な表示を確認できるようにします。

#### 5.2. 実装のポイント

*   **テキスト変更イベントの購読:**
    *   `editor.on('textChanged', (newText) => { ... });` を使用し、エディタのテキスト内容が変更されるたびに、新しいテキストを取得します。
*   **カクヨム記法の解析（パーシング）:**
    *   取得したテキストを、カクヨム記法のルール（正規表現など）に基づいて解析します。
    *   既存のJavaScriptライブラリでカクヨム記法を解析できるものがあれば、それを活用することを強く推奨します。なければ、自前でパーサーを実装する必要があります。
*   **HTMLへの変換（レンダリング）:**
    *   解析結果を、適切なHTMLタグ（例: `<ruby>`, `<p>`, `<h2>` など）に変換します。
*   **プレビュー表示:**
    *   変換したHTMLを、`editor.getDisplayArea()` で取得できるオーバーレイ要素、または専用に用意したプレビュー用のDOM要素に挿入します。
    *   入力エリアとプレビューエリアのスクロール位置を同期させることで、ユーザーの利便性を高めます。
*   **パフォーマンスの考慮:**
    *   テキストの変更が頻繁な場合、毎回全てのテキストを解析・変換するとパフォーマンスに影響が出る可能性があります。
    *   `setTimeout` を利用したデバウンス処理を導入し、ユーザーの入力が一定時間落ち着いてから解析・変換処理を実行するようにします。
*   **表示モードの連携:**
    *   エディタの表示モード（縦書き/横書き）に応じて、プレビュー表示のスタイルも適切に調整する必要があります。`editor.on('modeChanged', ...)` イベントを購読し、モード変更時にプレビューのCSSを切り替えるなどの対応が考えられます。
*   **エラーハンドリング:**
    *   不完全な記法や誤った記法が入力された場合に、プレビュー表示が崩れないように、適切なエラー表示やフォールバック処理を実装します。

#### 5.3. 利用例

```javascript
// index.html 内のスクリプト部分
const editor = new Editor({
    textareaId: 'main-editor',
    highlightOverlayId: 'highlight-overlay', // シンタックスハイライト用
    previewAreaId: 'kakuyomu-preview' // カクヨム記法プレビュー用（別途HTMLに要素が必要）
});

// ... その他のプラグイン登録

const kakuyomuNotationPlugin = new KakuyomuNotationPlugin(editor);
editor.registerPlugin(kakuyomuNotationPlugin);
```

---

この仕様書が、魚兎エディタのプラグイン開発の一助となれば幸いです。

### 6. その他のプラグインアイデア（単機能エディタにしないもの）

ここでは、魚兎エディタの機能をさらに豊かにする、単体では小さな機能だが、プラグインとして実装することで価値を提供するアイデアを列挙します。

#### 6.1. 文字数・行数カウントプラグイン

*   **目的:** 入力中のテキストの文字数、行数、段落数などをリアルタイムで表示します。
*   **機能:**
    *   エディタのテキスト内容が変更されるたびに、文字数、行数、段落数などを計算し、エディタのUIの特定の場所に表示します。
    *   全角・半角の区別や、改行コードの扱いなどを設定可能にすると、より実用的です。
*   **実装のポイント:**
    *   `editor.on('textChanged', ...)` イベントを購読します。
    *   パフォーマンスを考慮し、デバウンス処理を導入します。

#### 6.2. 自動保存・履歴管理プラグイン

*   **目的:** ユーザーの入力内容を自動で保存し、過去の編集履歴を管理することで、データ損失を防ぎ、安心して作業できるようにします。
*   **機能:**
    *   一定時間ごと、またはエディタが非アクティブになった際に、現在のテキスト内容をローカルストレージ（`localStorage`）などに自動保存します。
    *   保存された履歴を一覧表示し、任意の時点のテキスト内容に復元できる機能を提供します。
*   **実装のポイント:**
    *   `editor.on('textChanged', ...)` イベントを購読し、タイマーを設定します。
    *   ローカルストレージの容量制限や、履歴の管理方法（最新N件のみ保持など）を考慮します。

#### 6.3. スペルチェック・校正プラグイン

*   **目的:** 入力中の文章の誤字脱字、文法ミス、不適切な表現などをリアルタイムで指摘し、文章の品質向上を支援します。
*   **機能:**
    *   テキスト内容を解析し、スペルミスや文法的な誤りを検出します。
    *   検出された箇所に下線を表示したり、修正候補を提示したりします。
*   **実装のポイント:**
    *   `editor.on('textChanged', ...)` イベントを購読します。
    *   外部のスペルチェック・校正ライブラリ（例: LanguageToolのJavaScript版など）を利用することを検討します。
    *   パフォーマンスとリアルタイム性のバランスが重要です。

#### 6.4. ファイルツリー・プロジェクト管理プラグイン

*   **目的:** エディタのUI内に、現在開いているプロジェクトのファイル構造を表示し、ファイル間の移動や開閉を容易にします。
*   **機能:**
    *   指定されたディレクトリ（プロジェクトルート）以下のファイルやフォルダをツリー形式で表示します。
    *   ツリー内のファイルをクリックすることで、エディタでそのファイルを開けるようにします。
    *   ファイルの新規作成、削除、リネームなどの基本的なファイル操作機能を提供することも可能です。
*   **実装のポイント:**
    *   ブラウザのセキュリティ制約（ローカルファイルシステムへの直接アクセス制限）を考慮し、サーバーサイドのAPI連携や、ユーザーによるファイル選択ダイアログの利用などを検討します。
    *   `editor.emit('openFile', filePath);` のようなカスタムイベントをエディタコアに発行し、エディタコアがファイルを開く処理を担うようにすると良いでしょう。

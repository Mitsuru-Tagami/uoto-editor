## 魚兎エディタ プラグイン管理

このドキュメントでは、魚兎エディタのプラグインをどのように有効化・無効化するかについて説明します。

### 1. プラグインの有効化・無効化

プラグインの有効・無効は、主に以下の2つの方法で管理されます。

1.  **プラグインマネージャー（推奨）**:
    エディタのUI上にある「プラグイン管理」ボタンをクリックすると、プラグインマネージャーのモーダルウィンドウが開きます。ここで各プラグインのチェックボックスを操作し、「保存」ボタンをクリックすることで、プラグインの有効・無効を切り替えることができます。この設定は `localStorage` に保存され、次回エディタ起動時に自動的に適用されます。

2.  **`config/plugins.js` を直接編集する**:
    開発者向けの方法です。`uoto_editor/config/plugins.js` ファイルを開き、各プラグインの設定オブジェクトにある `enabled` プロパティの値を `true` または `false` に変更します。この変更は、`localStorage` の設定よりも優先されます。

**`config/plugins.js` の編集例:**
```javascript
// config/plugins.js (抜粋)

export const plugins = [
    {
        name: 'Vertical Writing Plugin',
        enabled: true, // 有効にする場合
        // ...
    },
    {
        name: 'Kakuyomu Notation Plugin',
        enabled: false, // 無効にする場合
        // ...
    },
];
```
上の例では、`VerticalWritingPlugin` と `KakuyomuNotationPlugin` が有効になり、`SyntaxHighlightPlugin` は無効になります。

### 2. プラグインの読み込みと登録

プラグインの読み込みと登録は、`js/main.js` が `config/plugins.js` の設定と `localStorage` に保存されたユーザーの状態に基づいて動的に行います。ユーザーが新しいプラグインを追加した場合、`config/plugins.js` にそのプラグインの設定を追加するだけで、自動的に読み込まれるようになっています。

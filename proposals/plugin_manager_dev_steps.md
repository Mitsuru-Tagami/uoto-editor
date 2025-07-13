# プラグインマネージャー作成手順書

## 1. 概要

魚兎エディタのプラグインを、エディタのUI上から管理するための「プラグインマネージャー」を作成する。
これにより、ユーザーは `config/plugins.js` を直接編集することなく、プラグインの有効・無効を切り替えることができるようになる。

## 2. 主な機能

-   エディタのUIからプラグイン管理画面（モーダルウィンドウ）を開く機能。
-   `config/plugins.js` に登録されているプラグインの一覧を表示する機能。
    -   ただし、`isCore: true` のフラグを持つプラグイン（プラグインマネージャー自身など）は管理対象から除外する。
-   各プラグインの有効/無効をチェックボックスで切り替える機能。
-   変更内容を保存する機能（現状はコンソールへの出力のみ）。

## 3. 作成手順

### 手順1: プラグインマネージャー用のディレクトリ作成

プラグインマネージャーの関連ファイルを格納するためのディレクトリを作成する。

```bash
mkdir -p plugins/plugin-manager
```

### 手順2: プラグイン設定ファイルへの登録

`config/plugins.js` に、プラグインマネージャー自身の設定を追記する。
このとき、自身を管理対象から除外するため、`isCore: true` のプロパティを追加する。

**変更前の `config/plugins.js` (抜粋):**
```javascript
export const plugins = [
    {
        name: 'Vertical Writing Plugin',
        // ...
    },
    // ...
];
```

**変更後の `config/plugins.js` (抜粋):**
```javascript
export const plugins = [
    {
        name: 'Plugin Manager',
        className: 'PluginManagerPlugin',
        path: '../plugins/plugin-manager/plugin-manager.js',
        cssPath: '../plugins/plugin-manager/plugin-manager.css',
        enabled: true,
        isCore: true, // ★ コアプラグインの目印
    },
    {
        name: 'Vertical Writing Plugin',
        // ...
    },
    // ...
];
```

### 手順3: プラグインマネージャーのJS/CSSファイル作成

プラグインマネージャーのロジックを記述するJavaScriptファイルと、UIのスタイルを定義するCSSファイルを新規作成する。

```bash
touch plugins/plugin-manager/plugin-manager.js
touch plugins/plugin-manager/plugin-manager.css
```

### 手順4: プラグインマネージャーのUIとロジック実装

`plugins/plugin-manager/plugin-manager.js` に、以下の機能を持つクラスを実装する。

-   コンストラクタでエディタのツールバーに「プラグイン管理」ボタンを追加する。
-   ボタンクリックで、プラグイン一覧を持つモーダルウィンドウを開く (`openModal`)。
-   `config/plugins.js` から `isCore: false` のプラグインをフィルタリングし、HTMLのテーブルを生成する (`createPluginList`)。
-   「保存」ボタンが押されたら、UIの状態から新しい設定配列を作成し、エディタ本体の保存機能を呼び出す (`saveSettings`)。
-   モーダルを閉じる機能 (`closeModal`)。

### 手順5: プラグインマネージャーのCSS実装

`plugins/plugin-manager/plugin-manager.css` に、モーダルウィンドウやテーブルのスタイルを定義する。

### 手順6: エディタ本体に設定保存機能を追加

`js/uoto-editor.js` に、プラグインから呼び出される設定保存用の関数 `savePluginSettings` を追加する。
この関数は、将来的にメインプロセスと通信してファイルを書き換えることを見越した非同期関数として実装する。

```javascript
// js/uoto-editor.js に追記
async savePluginSettings(newSettings) {
    try {
        // メインプロセス側のAPIを呼び出す想定
        await window.uotoEditorAPI.updatePluginConfig(newSettings);
        alert('プラグイン設定を保存しました。アプリケーションを再起動すると反映されます。');
    } catch (error) {
        console.error('プラグイン設定の保存に失敗しました:', error);
        alert('エラーが発生し、プラグイン設定を保存できませんでした。');
    }
}
```

### 手順7: メインプロセスとの連携APIを定義

`js/main.js` に、`uoto-editor.js` から呼び出される `window.uotoEditorAPI` を定義する。
今回は実際のファイル書き込みは行わず、コンソールに生成される設定内容を出力するまでを実装する。

```javascript
// js/main.js の末尾に追記
window.uotoEditorAPI = {
    updatePluginConfig: (newConfig) => {
        console.log("ipcRenderer.invoke('update-plugin-config') is called with:", newConfig);
        const configText = `export const plugins = ${JSON.stringify(newConfig, null, 4)};`;
        console.log("New config/plugins.js content would be:");
        console.log(configText);
        return Promise.resolve();
    }
};
```

## 4. 今後の課題

-   `window.uotoEditorAPI.updatePluginConfig` が、実際に `config/plugins.js` を書き換えるように、メインプロセス（ElectronやTauriなど）側の実装を行う必要がある。
-   プラグインの追加・削除や、並び順の変更機能。
-   より詳細なプラグイン設定（各プラグイン固有の設定項目など）を管理する機能。

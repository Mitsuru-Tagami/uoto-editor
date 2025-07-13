import { plugins } from '../config/plugins.js';

document.addEventListener('DOMContentLoaded', async () => {
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
        editorTitleId: 'editor-title',
        lineNumberId: 'line-numbers',
        toggleSinhaBtnId: 'toggle-sinha-btn'
    });

    // モード変更時にプレビューの表示を調整
    editorInstance.on('modeChanged', (mode) => {
        console.log(`Mode changed to: ${mode}, hasPreviewPlugin: ${editorInstance.hasPreviewPlugin}`);
        if (mode === 'vertical' && !editorInstance.hasPreviewPlugin) {
            editorInstance.setPreviewVisibility(false);
            console.log('Hiding preview.');
        } else {
            editorInstance.setPreviewVisibility(true);
            console.log('Showing preview.');
        }
    });

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
                // 依存関係があれば先にロード
                if (pluginConfig.dependencies && pluginConfig.dependencies.length > 0) {
                    for (const depPath of pluginConfig.dependencies) {
                        const script = document.createElement('script');
                        script.src = depPath;
                        script.async = false; // 順番にロード
                        document.head.appendChild(script);
                        await new Promise(resolve => script.onload = resolve); // ロード完了を待つ
                    }
                }

                const module = await import(pluginConfig.path);
                const PluginClass = module[pluginConfig.className];

                if (PluginClass) {
                    const pluginInstance = new PluginClass(editorInstance);
                    editorInstance.registerPlugin(pluginInstance);
                    console.log(`Plugin loaded: ${pluginConfig.name}`);

                    // プレビューを使用するプラグインを検出
                    if (pluginConfig.name === 'Kakuyomu Notation Plugin') {
                        editorInstance.hasPreviewPlugin = true;
                        console.log('Kakuyomu Notation Plugin enabled. editorInstance.hasPreviewPlugin set to true.');
                    }
                } else {
                    console.warn(`Plugin class "${pluginConfig.className}" not found in ${pluginConfig.path}`);
                }
            } catch (error) {
                console.error(`Failed to load plugin: ${pluginConfig.name}`, error);
            }
        }
    }

    // モード変更時にプレビューの表示を調整
    editorInstance.on('modeChanged', (mode) => {
        console.log(`Mode changed to: ${mode}, hasPreviewPlugin: ${editorInstance.hasPreviewPlugin}`);
        if (mode === 'vertical' && !editorInstance.hasPreviewPlugin) {
            editorInstance.setPreviewVisibility(false);
            console.log('Hiding preview.');
        } else {
            editorInstance.setPreviewVisibility(true);
            console.log('Showing preview.');
        }
    });

    // グローバルアクセス用
    window.uotoEditor = editorInstance;
    window.uotoEditor.plugins = plugins; // プラグイン設定をグローバルに保持

    // メインプロセスとの通信APIを定義
    window.uotoEditorAPI = {
        updatePluginConfig: (newConfig) => {
            // これはElectronやTauriなどの環境で、
            // メインプロセスに処理を依頼するための架空のコード
            // ipcRenderer.invoke('update-plugin-config', newConfig);

            // 今回はデモとして、ローカルで完結させるために
            // config/plugins.js を模した文字列を生成してコンソールに出力する
            console.log("ipcRenderer.invoke('update-plugin-config') is called with:", newConfig);

            const configText = `export const plugins = ${JSON.stringify(newConfig, null, 4)};`;
            console.log("New config/plugins.js content would be:");
            console.log(configText);

            // 本来はここでメインプロセスからの応答を待つ
            return Promise.resolve();
        }
    };

    // プラグインの有効/無効に基づいてUI要素の表示を制御
    window.uotoEditor.plugins.forEach(pluginConfig => {
        if (!pluginConfig.isCore && pluginConfig.uiElementId) {
            const uiElement = document.getElementById(pluginConfig.uiElementId);
            if (uiElement) {
                if (pluginConfig.enabled) {
                    uiElement.style.display = ''; // 表示
                } else {
                    uiElement.style.display = 'none'; // 非表示
                }
            }
        }
    });

    // Syntax Highlight Plugin の有効状態を editorInstance.isSinhaEnabled に反映
    const syntaxHighlightPluginConfig = plugins.find(p => p.name === 'Syntax Highlight Plugin');
    if (syntaxHighlightPluginConfig) {
        editorInstance.isSinhaEnabled = syntaxHighlightPluginConfig.enabled;
        // シンハONOFFボタンのテキストも更新
        const toggleSinhaBtn = document.getElementById('toggle-sinha-btn');
        if (toggleSinhaBtn) {
            toggleSinhaBtn.textContent = editorInstance.isSinhaEnabled ? 'シンタックスハイライトON' : 'シンタックスハイライトOFF';
        }
    }
});

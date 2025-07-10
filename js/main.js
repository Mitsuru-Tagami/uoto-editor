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
                const module = await import(pluginConfig.path);
                const PluginClass = module[pluginConfig.className];

                if (PluginClass) {
                    const pluginInstance = new PluginClass(editorInstance);
                    editorInstance.registerPlugin(pluginInstance);
                    console.log(`Plugin loaded: ${pluginConfig.name}`);
                } else {
                    console.warn(`Plugin class "${pluginConfig.className}" not found in ${pluginConfig.path}`);
                }
            } catch (error) {
                console.error(`Failed to load plugin: ${pluginConfig.name}`, error);
            }
        }
    }

    // グローバルアクセス用
    window.uotoEditor = editorInstance;
});

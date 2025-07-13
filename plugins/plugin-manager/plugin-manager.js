class PluginManagerPlugin {
    constructor(editor) {
        this.editor = editor;
    }

    init() {
        // HTMLに既にあるボタンを取得してイベントを設定する
        const settingsButton = document.getElementById('plugin-manager-btn');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.openModal());
        } else {
            console.error('Plugin Manager button not found!');
        }
    }

    openModal() {
        // 既にモーダルが開いていれば閉じる
        this.closeModal();

        // モーダルウィンドウの作成
        const modal = document.createElement('div');
        modal.id = 'plugin-manager-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2>プラグイン管理</h2>
                <table id="plugin-list">
                    <thead>
                        <tr>
                            <th>有効</th>
                            <th>プラグイン名</th>
                            <th>説明</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.createPluginList()}
                    </tbody>
                </table>
                <button id="save-plugin-settings">保存</button>
            </div>
        `;

        document.body.appendChild(modal);

        // イベントリスナーの設定
        modal.querySelector('.close-button').addEventListener('click', () => this.closeModal());
        modal.querySelector('#save-plugin-settings').addEventListener('click', () => this.saveSettings());
    }

    createPluginList() {
        // 動的にimportしたいため、ここではconfigを直接参照しない
        // uoto-editor本体から渡されることを期待するか、あるいは動的importを利用する
        // 今回は、main.jsで読み込まれた`plugins`変数をグローバルスコープから参照する想定で進める
        const savedStates = JSON.parse(localStorage.getItem('uotoEditorPluginStates')) || {};

        return window.uotoEditor.plugins
            .filter(plugin => !plugin.isCore) // isCoreでないプラグインのみ表示
            .map(plugin => {
                const isEnabled = savedStates[plugin.name] !== undefined ? savedStates[plugin.name] : plugin.enabled;
                return `
                <tr>
                    <td><input type="checkbox" data-plugin-name="${plugin.name}" ${isEnabled ? 'checked' : ''}></td>
                    <td>${plugin.name}</td>
                    <td>${plugin.description || '説明なし'}</td>
                </tr>
            `;
            }).join('');
    }

    saveSettings() {
        const checkboxes = document.querySelectorAll('#plugin-list input[type="checkbox"]');
        const updatedPlugins = window.uotoEditor.plugins.map(plugin => {
            if (plugin.isCore) {
                return plugin; // コアプラグインは変更しない
            }
            const checkbox = Array.from(checkboxes).find(cb => cb.dataset.pluginName === plugin.name);
            return {
                ...plugin,
                enabled: checkbox ? checkbox.checked : plugin.enabled
            };
        });

        // LocalStorageにプラグインの状態を保存
        const statesToSave = {};
        updatedPlugins.forEach(plugin => {
            if (!plugin.isCore) {
                statesToSave[plugin.name] = plugin.enabled;
            }
        });
        localStorage.setItem('uotoEditorPluginStates', JSON.stringify(statesToSave));

        // uoto-editor.jsに新しく追加した関数を呼び出す
        this.editor.savePluginSettings(updatedPlugins)
            .then(() => {
                this.closeModal();
            });
    }

    closeModal() {
        const modal = document.getElementById('plugin-manager-modal');
        if (modal) {
            modal.remove();
        }
    }
}

export { PluginManagerPlugin };

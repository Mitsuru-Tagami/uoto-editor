class Editor {
    constructor(options) {
        this.editorElement = document.getElementById(options.editorId);
        this.previewElement = document.getElementById(options.previewId);
        this.openBtn = document.getElementById(options.openBtnId);
        this.saveBtn = document.getElementById(options.saveBtnId);
        this.fileInput = document.getElementById(options.fileInputId);
        this.searchInput = document.getElementById(options.searchInputId);
        this.replaceInput = document.getElementById(options.replaceInputId);
        this.findNextBtn = document.getElementById(options.findNextBtnId);
        this.replaceBtn = document.getElementById(options.replaceBtnId);
        this.replaceAllBtn = document.getElementById(options.replaceAllBtnId);
        this.editorTitleElement = document.getElementById(options.editorTitleId);

        this.lineNumberElement = document.getElementById(options.lineNumberId); // 行番号要素を追加
        this.showLineNumbers = localStorage.getItem('showLineNumbers') === 'false' ? false : true; // 行番号の表示状態をlocalStorageから読み込む

        this.toggleSinhaBtn = document.getElementById(options.toggleSinhaBtnId); // シンハONOFFボタンを追加
        this.isSinhaEnabled = true; // シンハの有効状態

        this.isVerticalMode = false; // 初期状態は横書きに変更
        this.lastFoundIndex = -1;
        this.events = {}; // イベントリスナーを格納するオブジェクト
        this.hasPreviewPlugin = false; // プレビューを使用するプラグインが有効かどうか

        this._setupEventListeners();
        this._initialSetup();
    }

    // イベントシステム
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => callback(data));
        }
    }

    // プレビューの表示/非表示を切り替える
    setPreviewVisibility(visible) {
        if (visible) {
            this.previewElement.style.display = '';
            this.previewElement.style.flex = '1'; // 再表示時にflexを元に戻す
        } else {
            this.previewElement.style.display = 'none';
            this.previewElement.style.flex = '0'; // 非表示時にflexを0にする
        }
    }

    // イベントリスナーの設定
    _setupEventListeners() {
        // this.editorTitleElement.addEventListener('click', this.toggleWritingMode.bind(this)); // プラグインに移動
        this.editorElement.addEventListener('input', this._handleEditorInput.bind(this));
        this.editorElement.addEventListener('scroll', this.updateLineNumbers.bind(this)); // スクロールイベントを追加

        this.openBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', this._handleFileInputChange.bind(this));
        this.saveBtn.addEventListener('click', this._handleSaveBtnClick.bind(this));

        this.findNextBtn.addEventListener('click', this.findNext.bind(this));
        this.replaceBtn.addEventListener('click', this.replaceSelected.bind(this));
        this.replaceAllBtn.addEventListener('click', this.replaceAll.bind(this));
        this.searchInput.addEventListener('input', () => { this.lastFoundIndex = -1; });

        // 行番号のクリックイベント
        if (this.lineNumberElement) {
            this.lineNumberElement.addEventListener('click', this.toggleLineNumbers.bind(this));
        }

        // シンハONOFFボタンのクリックイベント
        if (this.toggleSinhaBtn) {
            this.toggleSinhaBtn.addEventListener('click', this.toggleSinha.bind(this));
        }

        // モード変更時に行番号を更新
        this.on('modeChanged', () => {
            this.updateLineNumbers();
        });
    }

    // 初期設定
    _initialSetup() {
        // 初期モード設定はプラグインに任せる
        this.updateLineNumbers(); // 初期表示時に行番号を更新
        // シンハONOFFボタンの初期表示を設定
        if (this.toggleSinhaBtn) {
            this.toggleSinhaBtn.textContent = this.isSinhaEnabled ? 'シンタックスハイライトON' : 'シンタックスハイライトOFF';
        }
    }

    // コア機能
    // toggleWritingModeはプラグインに移動

    _handleEditorInput() {
        // this.previewElement.innerHTML = this.editorElement.value; // カクヨム記法プラグインがプレビューを更新するため、この行は不要
        this.updateLineNumbers(); // テキスト変更時に行番号を更新
        this.emit('textChanged', this.editorElement.value);
    }

    _handleFileInputChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.editorElement.value = e.target.result;
            this.updateLineNumbers(); // ファイル読み込み時に行番号を更新
            this.emit('textChanged', this.editorElement.value);
        };
        reader.readAsText(file);
    }

    _handleSaveBtnClick() {
        const textToSave = this.editorElement.value;
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().toTimeString().slice(0, 8).replace(/:/g, '')}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    prepareTerm(term) {
        return term.replace(/\\n/g, '\n').replace(/\\s/g, ' ');
    }

    findNext() {
        const searchTerm = this.prepareTerm(this.searchInput.value);
        if (!searchTerm) return;

        const editorText = this.editorElement.value;
        let startIndex = this.editorElement.selectionEnd;

        if (this.lastFoundIndex !== -1 && startIndex === this.lastFoundIndex + searchTerm.length) {
            startIndex = this.lastFoundIndex + searchTerm.length;
        } else {
            startIndex = this.editorElement.selectionStart;
        }

        let foundIndex = editorText.indexOf(searchTerm, startIndex);

        if (foundIndex === -1 && startIndex !== 0) {
            foundIndex = editorText.indexOf(searchTerm, 0);
        }

        if (foundIndex !== -1) {
            this.editorElement.setSelectionRange(foundIndex, foundIndex + searchTerm.length);
            this.editorElement.focus();
            this.lastFoundIndex = foundIndex;
        } else {
            alert('見つかりませんでした。');
            this.lastFoundIndex = -1;
        }
    }

    replaceSelected() {
        const searchTerm = this.prepareTerm(this.searchInput.value);
        const replaceTerm = this.prepareTerm(this.replaceInput.value);
        if (!searchTerm || this.editorElement.selectionStart === this.editorElement.selectionEnd) return;

        const start = this.editorElement.selectionStart;
        const end = this.editorElement.selectionEnd;
        const selectedText = this.editorElement.value.substring(start, end);

        if (selectedText === searchTerm) {
            this.editorElement.setRangeText(replaceTerm, start, end, 'end');
            this.editorElement.focus();
            this.lastFoundIndex = -1;
            this.updateEOFIndicator();
            this.emit('textChanged', this.editorElement.value);
        }
        else {
            alert('選択されているテキストが検索ワードと一致しません。');
        }
    }

    replaceAll() {
        const searchTerm = this.prepareTerm(this.searchInput.value);
        const replaceTerm = this.prepareTerm(this.replaceInput.value);
        if (!searchTerm) return;

        const originalText = this.editorElement.value;
        const newText = originalText.split(searchTerm).join(replaceTerm);

        if (originalText !== newText) {
            this.editorElement.value = newText;
            alert(`${originalText.split(searchTerm).length - 1} 件を置換しました。`);
            this.lastFoundIndex = -1;
            this.updateEOFIndicator();
            this.emit('textChanged', this.editorElement.value);
        }
        else {
            alert('置換する箇所が見つかりませんでした。');
        }
    }

    // プラグイン設定を保存する (Node.jsのAPIを呼び出す)
    async savePluginSettings(newSettings) {
        try {
            // fs-extraの代わりに、UotoEditorが提供するAPIを呼び出す想定
            // このAPIはメインプロセスでファイルの書き込みを行う
            await window.uotoEditorAPI.updatePluginConfig(newSettings);
            alert('プラグイン設定を保存しました。アプリケーションを再起動すると反映されます。');
        } catch (error) {
            console.error('プラグイン設定の保存に失敗しました:', error);
            alert('エラーが発生し、プラグイン設定を保存できませんでした。');
        }
    }

    // 行番号の更新
    updateLineNumbers() {
        if (!this.lineNumberElement) {
            return;
        }

        // 縦書きモードの場合は行番号を非表示にする
        if (this.editorElement.classList.contains('vertical-writing')) {
            this.lineNumberElement.style.display = 'none';
            return;
        }

        if (this.showLineNumbers && this.editorElement.classList.contains('horizontal-writing')) {
            this.lineNumberElement.style.display = 'block';
            const text = this.editorElement.value;
            const lines = text.split('\n');
            let lineNumbersHtml = '';
            for (let i = 1; i <= lines.length; i++) {
                lineNumbersHtml += `<div>${i}</div>`;
            }
            this.lineNumberElement.innerHTML = lineNumbersHtml;

            // 行番号のスクロール位置をエディタと同期
            this.lineNumberElement.scrollTop = this.editorElement.scrollTop;
        }
        else {
            this.lineNumberElement.style.display = 'none';
        }
    }

    // 行番号の表示・非表示を切り替える
    toggleLineNumbers() {
        this.showLineNumbers = !this.showLineNumbers;
        localStorage.setItem('showLineNumbers', this.showLineNumbers); // 状態をlocalStorageに保存
        this.updateLineNumbers();
    }

    // プラグイン登録
    registerPlugin(plugin) {
        if (plugin && typeof plugin.init === 'function') {
            plugin.init(this);
        }
        else {
            console.warn('Invalid plugin: init method not found.');
        }
    }

    // プラグインがアクセスするためのゲッター
    getTextContent() {
        return this.editorElement.value;
    }

    getDisplayArea() {
        return this.previewElement;
    }

    getCurrentMode() {
        return this.isVerticalMode ? 'vertical' : 'horizontal';
    }

    // シンハの表示・非表示を切り替える
    toggleSinha() {
        this.isSinhaEnabled = !this.isSinhaEnabled;
        console.log('シンハの有効状態:', this.isSinhaEnabled);
        this.toggleSinhaBtn.textContent = this.isSinhaEnabled ? 'シンタックスハイライトON' : 'シンタックスハイライトOFF';
        this.emit('sinhaToggled', this.isSinhaEnabled); // sinhaToggledイベントを発行
        this.emit('textChanged', this.getTextContent()); // テキスト変更イベントを発行して再描画を促す
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const editorInstance = new Editor({
        editorId: 'editor',
        previewId: 'preview',
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
        toggleSinhaBtnId: 'toggle-sinha-btn' // シンハONOFFボタンのIDを追加
    });

    // グローバルアクセス用 (デバッグや将来のプラグインで必要になる場合)
    window.uotoEditor = editorInstance;
});
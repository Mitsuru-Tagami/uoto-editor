class Editor {
    constructor(options) {
        this.editorElement = document.getElementById(options.editorId);
        this.previewElement = document.getElementById(options.previewId);
        this.eofIndicatorElement = document.getElementById(options.eofIndicatorId);
        this.openBtn = document.getElementById(options.openBtnId);
        this.saveBtn = document.getElementById(options.saveBtnId);
        this.fileInput = document.getElementById(options.fileInputId);
        this.searchInput = document.getElementById(options.searchInputId);
        this.replaceInput = document.getElementById(options.replaceInputId);
        this.findNextBtn = document.getElementById(options.findNextBtnId);
        this.replaceBtn = document.getElementById(options.replaceBtnId);
        this.replaceAllBtn = document.getElementById(options.replaceAllBtnId);
        this.editorTitleElement = document.getElementById(options.editorTitleId);

        this.isVerticalMode = true; // 初期状態は縦書き
        this.lastFoundIndex = -1;
        this.events = {}; // イベントリスナーを格納するオブジェクト

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

    // イベントリスナーの設定
    _setupEventListeners() {
        // this.editorTitleElement.addEventListener('click', this.toggleWritingMode.bind(this)); // プラグインに移動
        this.editorElement.addEventListener('input', this._handleEditorInput.bind(this));
        window.addEventListener('resize', this.updateEOFIndicator.bind(this));

        this.openBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', this._handleFileInputChange.bind(this));
        this.saveBtn.addEventListener('click', this._handleSaveBtnClick.bind(this));

        this.findNextBtn.addEventListener('click', this.findNext.bind(this));
        this.replaceBtn.addEventListener('click', this.replaceSelected.bind(this));
        this.replaceAllBtn.addEventListener('click', this.replaceAll.bind(this));
        this.searchInput.addEventListener('input', () => { this.lastFoundIndex = -1; });
    }

    // 初期設定
    _initialSetup() {
        // 初期モード設定はプラグインに任せる
        this.updateEOFIndicator();
    }

    // コア機能
    // toggleWritingModeはプラグインに移動

    _handleEditorInput() {
        this.previewElement.innerHTML = this.editorElement.value;
        this.updateEOFIndicator();
        this.emit('textChanged', this.editorElement.value);
    }

    updateEOFIndicator() {
        const hasVerticalScrollbar = this.editorElement.scrollHeight > this.editorElement.clientHeight;
        const hasHorizontalScrollbar = this.editorElement.scrollWidth > this.editorElement.clientWidth;

        if (this.editorElement.value === '' || (!hasVerticalScrollbar && !hasHorizontalScrollbar)) {
            this.eofIndicatorElement.style.display = 'block';
        } else {
            this.eofIndicatorElement.style.display = 'none';
        }
    }

    _handleFileInputChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.editorElement.value = e.target.result;
            this.updateEOFIndicator();
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
        } else {
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
        } else {
            alert('置換する箇所が見つかりませんでした。');
        }
    }

    // プラグイン登録
    registerPlugin(plugin) {
        if (plugin && typeof plugin.init === 'function') {
            plugin.init(this);
        } else {
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
}

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

    // グローバルアクセス用 (デバッグや将来のプラグインで必要になる場合)
    window.uotoEditor = editorInstance;
});
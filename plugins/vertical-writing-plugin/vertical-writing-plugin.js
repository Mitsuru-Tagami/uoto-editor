export class VerticalWritingPlugin {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.isVerticalMode = true; // 初期状態は縦書き
    }

    init() {
        this.editor.editorTitleElement.addEventListener('click', () => {
            this.toggleWritingMode();
        });

        // 初期表示を縦書きに設定
        this.setMode(this.isVerticalMode);
    }

    toggleWritingMode() {
        this.isVerticalMode = !this.isVerticalMode;
        this.setMode(this.isVerticalMode);
    }

    setMode(isVertical) {
        this.editor.isVerticalMode = isVertical;
        const editorElement = this.editor.editorElement;
        const previewElement = this.editor.previewElement;

        if (isVertical) {
            editorElement.classList.remove('horizontal-writing');
            editorElement.classList.add('vertical-writing');
            previewElement.classList.remove('horizontal-writing');
            previewElement.classList.add('vertical-writing');
            this.editor.editorWrapperElement.classList.add('vertical-mode'); // ラッパーにvertical-modeクラスを追加
            this.editor.editorTitleElement.textContent = '魚兎エディタ (縦書き)';
            this.editor.emit('modeChanged', 'vertical');
        } else {
            this.editor.editorElement.classList.remove('vertical-writing');
            this.editor.editorElement.classList.add('horizontal-writing');
            this.editor.editorWrapperElement.classList.remove('vertical-mode'); // ラッパーからvertical-modeクラスを削除
            this.editor.emit('modeChanged', 'horizontal');
        }
    }
}

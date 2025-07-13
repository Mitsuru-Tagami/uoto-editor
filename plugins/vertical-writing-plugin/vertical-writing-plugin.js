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
            this.editor.editorTitleElement.textContent = '魚兎エディタ (縦書き)';
            this.editor.emit('modeChanged', 'vertical');
        } else {
            editorElement.classList.remove('vertical-writing');
            editorElement.classList.add('horizontal-writing');
            previewElement.classList.remove('vertical-writing');
            previewElement.classList.add('horizontal-writing');
            this.editor.editorTitleElement.textContent = '魚兎エディタ (横書き)';
            this.editor.emit('modeChanged', 'horizontal');
        }
    }
}

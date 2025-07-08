export class VerticalWritingPlugin {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.isVerticalMode = true; // プラグイン内でモードを管理
    }

    init(editor) {
        this.editor = editor || this.editor;

        // エディタのタイトルクリックでモードを切り替える
        this.editor.editorTitleElement.addEventListener('click', () => {
            this.toggleWritingMode();
        });

        // 初期表示
        this.editor.editorElement.classList.add('vertical-writing');
        this.editor.previewElement.classList.add('vertical-writing');
        this.editor.editorTitleElement.textContent = '魚兎エディタ (縦書き)';

        console.log('VerticalWritingPlugin initialized.');
        console.log('Editor has vertical-writing class:', this.editor.editorElement.classList.contains('vertical-writing'));
        console.log('Preview has vertical-writing class:', this.editor.previewElement.classList.contains('vertical-writing'));
        console.log('Editor title text:', this.editor.editorTitleElement.textContent);
    }

    toggleWritingMode() {
        this.isVerticalMode = !this.isVerticalMode;
        if (this.isVerticalMode) {
            // 縦書きモードに切り替え
            this.editor.editorElement.classList.remove('horizontal-writing');
            this.editor.editorElement.classList.add('vertical-writing');
            this.editor.previewElement.classList.remove('horizontal-writing');
            this.editor.previewElement.classList.add('vertical-writing');
            this.editor.editorTitleElement.textContent = '魚兎エディタ (縦書き)';
            this.editor.emit('modeChanged', 'vertical');
        } else {
            // 横書きモードに切り替え
            this.editor.editorElement.classList.remove('vertical-writing');
            this.editor.editorElement.classList.add('horizontal-writing');
            this.editor.previewElement.classList.remove('vertical-writing');
            this.editor.previewElement.classList.add('horizontal-writing');
            this.editor.editorTitleElement.textContent = '魚兎エディタ (横書き)';
            this.editor.emit('modeChanged', 'horizontal');
        }
        this.editor.updateEOFIndicator(); // EOF表示はコアで管理
    }
}

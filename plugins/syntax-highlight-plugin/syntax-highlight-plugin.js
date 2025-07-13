export class SyntaxHighlightPlugin {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.debounceTimer = null;
    }

    init() {
        this.editor.on('textChanged', (newText) => {
            this.handleUpdate(newText);
        });

        this.editor.on('sinhaToggled', (isEnabled) => {
            this.handleUpdate(this.editor.getTextContent());
        });

        this.editor.on('modeChanged', (mode) => {
            this.handleUpdate(this.editor.getTextContent());
        });

        // 初期表示
        this.handleUpdate(this.editor.getTextContent());
    }

    handleUpdate(text) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.updateHighlight(text);
        }, 150); // 少し短縮
    }

    updateHighlight(text) {
        const previewElement = this.editor.getDisplayArea();
        const editorElement = this.editor.editorElement;

        // シンハが無効な場合は、プレビューをクリア
        if (!this.editor.isSinhaEnabled) {
            previewElement.innerHTML = '';
            return;
        }

        // 縦書きモードの場合は、プレビューをクリア
        if (this.editor.getCurrentMode() === 'vertical') {
            previewElement.innerHTML = '';
            return;
        }

        // 横書きかつシンハが有効な場合

        // Prism.jsがロードされているか確認
        if (typeof Prism === 'undefined' || !Prism.languages.javascript) {
            console.log('Prism.js or javascript language not loaded.');
            previewElement.innerText = text; // Prismがなければプレーンテキストを表示
            return;
        }

        const highlightedHtml = Prism.highlight(text, Prism.languages.javascript, 'javascript');
        console.log('Highlighted HTML:', highlightedHtml);
        previewElement.innerHTML = `<pre><code class="language-javascript">${highlightedHtml}</code></pre>`;
        console.log('Preview element innerHTML after update:', previewElement.innerHTML);
        console.log('Preview element display style after update:', previewElement.style.display);

        // スクロール位置を同期
        editorElement.addEventListener('scroll', () => {
            previewElement.scrollTop = editorElement.scrollTop;
            previewElement.scrollLeft = editorElement.scrollLeft;
        }, { passive: true });
    }
}

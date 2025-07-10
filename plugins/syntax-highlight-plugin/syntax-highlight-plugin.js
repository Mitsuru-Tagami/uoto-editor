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

        // 縦書きモードまたはシンハが無効な場合は、ハイライトを解除して非表示
        if (this.editor.getCurrentMode() === 'vertical' || !this.editor.isSinhaEnabled) {
            previewElement.style.display = 'none';
            editorElement.style.color = ''; // テキストの透明化を解除
            return;
        }

        // 横書きかつシンハが有効な場合
        previewElement.style.display = 'block';
        editorElement.style.color = 'transparent'; // テキストを透明に

        // Prism.jsがロードされているか確認
        if (typeof Prism === 'undefined' || !Prism.languages.javascript) {
            previewElement.innerText = text; // Prismがなければプレーンテキストを表示
            return;
        }

        const highlightedHtml = Prism.highlight(text, Prism.languages.javascript, 'javascript');
        previewElement.innerHTML = `<pre><code class="language-javascript">${highlightedHtml}</code></pre>`;

        // スクロール位置を同期
        editorElement.addEventListener('scroll', () => {
            previewElement.scrollTop = editorElement.scrollTop;
            previewElement.scrollLeft = editorElement.scrollLeft;
        }, { passive: true });
    }
}

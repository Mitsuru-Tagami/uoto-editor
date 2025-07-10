class KakuyomuNotationPlugin {
    constructor(editorInstance) {
        this.editor = editorInstance;
        this.previewElement = this.editor.getDisplayArea();
        this.debounceTimer = null;
    }

    init() {
        // テキスト変更イベントを購読
        this.editor.on('textChanged', (newText) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.updatePreview(newText);
            }, 300); // 300msのデバウンス
        });

        // モード変更イベントを購読
        this.editor.on('modeChanged', (newMode) => {
            this.updatePreview(this.editor.getTextContent()); // モード変更時にもプレビューを更新
        });

        // 初期表示
        this.updatePreview(this.editor.getTextContent());

        // カクヨム記法ヒントを動的に追加
        const controlsDiv = document.querySelector('.controls');
        if (controlsDiv) {
            const hintSpan = document.createElement('span');
            hintSpan.style.fontSize = '12px';
            hintSpan.style.color = '#666';
            hintSpan.style.marginLeft = '10px';
            hintSpan.textContent = 'カクヨム記法: ｜漢字《ルビ》、傍点《《傍点》》';
            controlsDiv.appendChild(hintSpan);
        }
    }

    updatePreview(text) {
        // シンハが有効な場合は、カクヨム記法プラグインはプレビューを更新しない
        if (this.editor.isSinhaEnabled) {
            return;
        }
        // console.log('KakuyomuNotationPlugin: updatePreview called. Current mode:', this.editor.getCurrentMode()); // デバッグ用ログを削除
        if (this.editor.getCurrentMode() === 'horizontal') {
            // 横書きモードの場合のみプレビューを生成
            let renderedHtml = this.parseAndRenderKakuyomu(text);
            this.previewElement.innerHTML = renderedHtml;
            this.previewElement.style.display = 'block'; // プレビューを表示
        } else {
            // 縦書きモードの場合、プレビューをクリアして非表示
            this.previewElement.innerHTML = '';
            this.previewElement.style.display = 'none'; // プレビューを非表示
        }
    }
        // console.log('KakuyomuNotationPlugin: updatePreview called. Current mode:', this.editor.getCurrentMode()); // デバッグ用ログを削除
        if (this.editor.getCurrentMode() === 'horizontal') {
            // 横書きモードの場合のみプレビューを生成
            let renderedHtml = this.parseAndRenderKakuyomu(text);
            this.previewElement.innerHTML = renderedHtml;
            this.previewElement.style.display = 'block'; // プレビューを表示
        } else {
            // 縦書きモードの場合、プレビューをクリアして非表示
            this.previewElement.innerHTML = '';
            this.previewElement.style.display = 'none'; // プレビューを非表示
        }
    }

    // カクヨム記法をHTMLに変換する（簡易版）
    parseAndRenderKakuyomu(text) {
        // 例: ルビ記法「｜漢字《ルビ》」を<ruby>タグに変換
        // この正規表現は簡易的なもので、より堅固なパーサーが必要になる場合があります。
        let html = text.replace(/｜([^《]+?)《([^》]+?)》/g, '<ruby>$1<rt>$2</rt></ruby>');

        // 例: 強調記法「《強調》」を<em>タグに変換
        html = html.replace(/《([^》]+?)》/g, '<em>$1</em>');

        // 例: 傍点記法「《《傍点》》」を<span class="emphasis">タグに変換
        html = html.replace(/《《([^》]+?)》》/g, '<span class="emphasis">$1</span>');

        // 改行を<br>タグに変換（プレビュー用）
        html = html.replace(/\n/g, '<br>');

        return html;
    }
}

export { KakuyomuNotationPlugin };
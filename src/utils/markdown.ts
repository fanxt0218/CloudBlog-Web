import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css' // Using a dark theme for code blocks

const md: MarkdownIt = new MarkdownIt({
    html: false, // Double check security, usually false is safer for user content
    linkify: true,
    typographer: true,
    highlight: function (str: string, lang: string): string {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                    '</code></pre>';
            } catch (__) { }
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
})

// Custom renderer for links to open in new tab
const defaultRender = md.renderer.rules.link_open || function (tokens: any[], idx: number, options: any, env: any, self: any) {
    return self.renderToken(tokens, idx, options);
};

md.renderer.rules.link_open = function (tokens: any[], idx: number, options: any, env: any, self: any) {
    // If you are sure other plugins don't add `target` - drop check()
    var aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']); // add new attribute
    } else {
        tokens[idx].attrs![aIndex][1] = '_blank';    // replace value of existing attr
    }

    // Pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
};

export const renderMarkdown = (text: string) => {
    return md.render(text || '')
}

/**
 * downatello
 */

(function(window, undefined){

    // MARKDOWN ENGINE
    var MarkdownEngine = {
        element: Node.ELEMENT_NODE,
        text: Node.TEXT_NODE,

        tags: {
            blocks: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'ol', 'ul', 'li', 'header', 'nav',
                'aside', 'article', 'footer', 'br', 'hr'],
            inlines: ['a', 'em', 'i', 'strong', 'b', 'u', 'code', 'img', 'span']
        },

        isBlock: function(elem) {
            if(elem == null || elem.nodeType == MarkdownEngine.text)
            {
                return false;
            }

            var tag = elem.tagName.toLowerCase();
            for(var i in this.tags.blocks) {
                if(tag == this.tags.blocks[i])
                {
                    return true;
                }
            }
            return false;
        },

        isInline: function(elem) {
            if(elem == null)
            {
                return false;
            }

            var tag = elem.tagName.toLowerCase();
            for(var i in this.tags.inlines) {
                if(tag == this.tags.inlines[i])
                {
                    return true;
                }
            }
            return false;
        },

        unindent: function(string) {
            return string.replace(/^\s{2,}/, '').replace(/^\n/, '').replace(/\s+$/, ' ');
        },

        escapeQuotes: function(string) {
            return string.replace(/"/, '\\"');
        },

        concatSpaces: function(string) {
            return string.replace(/\s{2,}/, ' ');
        },

        /**
         * Escape Markdown special chars :
         *
             \   backslash
             `   backtick
             *   asterisk
             _   underscore
             {}  curly braces
             []  square brackets
             ()  parentheses
             #   hash mark
             +   plus sign
             -   minus sign (hyphen)
             .   dot
             !   exclamation mark
         *
         */
        escapeSpecialChars: function(string) {
            return string.replace(/(\\|`|\*|_|\{|\}|\[|\]|\(|\)|#|\+|-|!)/g, '\\$1')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&(?!amp;)/g, '&amp;');
        },

        markdownify: function(html) {
            var markdown = '';
            var error;
            var empty;
            var elem;
            var parent;


            if(html.childNodes && html.childNodes.length > 0)
            {
                for(var i = 0; i< html.childNodes.length; i++)
                {
                    error = false;
                    empty = false;
                    elem = html.childNodes[i];

                    if(elem.nodeType == MarkdownEngine.text)
                    {
                        if(/\S+/g.test(elem.textContent))
                        {
                            markdown += this.concatSpaces(this.unindent(this.escapeSpecialChars(elem.textContent)));
                        }
                        else
                        {
                            var previous = elem.previousSibling;
                            var next = elem.nextSibling;

                            // if this 'space only' text node is not the first or last element in its parent
                            if(previous && next && MarkdownEngine.isInline(previous) && MarkdownEngine.isInline(next))
                            {
                                markdown += ' ';
                            }
                            else
                            {
                                empty = true;
                            }
                        }
                    }

                    else if(elem.nodeType == MarkdownEngine.element)
                    {
                        switch (elem.tagName.toLowerCase())
                        {
                            // blocks
                            case 'article':
                            case 'aside':
                            case 'header':
                            case 'footer':
                            case 'section':
                            case 'nav':
                            case 'p':
                            case 'div':
                                markdown += this.markdownify(elem);
                                break;

                            case 'ol':
                            case 'ul':
                                var number = elem.tagName.toLowerCase() == 'ol';
                                var len = elem.children.length;
                                for(var j = 1; j<=len; j++)
                                {
                                    markdown += (number ?  j + '.' : '*') + ' ' + this.markdownify(elem.children[j-1])
                                        + ((j == len) ? '' : '\n');
                                }
                                break;
                            case 'br':
                                break;
                            case 'hr':
                                markdown += '- - -';
                                break;

                            case 'h1':
                                markdown += '#' + this.markdownify(elem);
                                break;
                            case 'h2':
                                markdown += '##' + this.markdownify(elem);
                                break;
                            case 'h3':
                                markdown += '###' + this.markdownify(elem);
                                break;
                            case 'h4':
                                markdown += '####' + this.markdownify(elem);
                                break;
                            case 'h5':
                                markdown += '#####' + this.markdownify(elem);
                                break;
                            case 'h6':
                                markdown += '######' + this.markdownify(elem);
                                break;

                            // inlines
                            case 'img':
                                markdown += '![' + (elem.alt || ' ') + ']('
                                    + this.escapeSpecialChars(elem.src)
                                    + (elem.title ? ' "' + this.escapeQuotes(elem.title) + '"' : '') +  ')';
                                break;
                            case 'a':
                                markdown += '[' + this.markdownify(elem) + ']('
                                    + this.escapeSpecialChars(elem.href) + ')';
                                break;

                            case 'b':
                            case 'strong':
                                markdown += '**' + this.markdownify(elem) + '**';
                                break;

                            case 'em':
                            case 'i':
                                markdown += '_' + this.markdownify(elem) + '_';
                                break;

                            case 'u':
                                markdown += this.markdownify(elem);
                                break;

                            //case 'code':
                                //markdown += '`'  + '`';

                            case 'span':
                                var text = this.markdownify(elem);

                                if(elem.style && (elem.style.fontWeight == 'bold' || elem.style.fontWeight == 'bolder'))
                                {
                                    text = '**' + text + '**';
                                }

                                if (elem.style && elem.style.fontStyle == 'italic')
                                {
                                    text = '_' + text + '_';
                                }

                                markdown += text;
                                break;
                            default:
                                error = true;
                                break;
                        }
                    }
                    else
                    {
                        error = true;
                    }

                    parent = elem.parentNode || elem.parentElement;
                    if(parent == MarkdownEngine.source && !empty)
                    {
                        markdown += '\n\n';
                    }
                }
            }

            return markdown;
        }
    };

    var HtmlEngine = {

        htmlize: function(string){
            var blocks = string.split('\n\n');
            var block;

            for(var i in blocks)
            {
                block = blocks[i];

                // replace inline elements
                block = block.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, '<strong>$2</strong>');
                block = block.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, '<em>$2</em>');
                //block = block.replace(/(`)(?=\S)([^\r]*?\S)\1/g, '<code>$2</code>');

                // images
                block = block.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,
                    function(){
                        return '<img src="' + arguments[4] + '" alt="'
                            + (arguments[2] ? arguments[2] : arguments[4])+ '"'
                            + (arguments[7] ? ' title="' + arguments[7] + '"' : '') + '/>';
                    }
                );

                // links
                block = block.replace(/(\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,
                    function(){
                        return '<a href="' + arguments[4] + '"'
                            + (arguments[7] ? ' title="' + arguments[7] + '"' : '')
                            +'>' + arguments[2] + '</a>';
                    }
                );

                if(/^((-|\*|_) ?)+$/.test(block))
                {
                    block = '<hr />';
                }

                if(/^#{1,6}(.*)/.test(block))
                {
                    block = this.heading(block);
                }

                if(/^(( {1,3})?(\d\.|[\*|\+|-])( *|[\t])?(.*)(\n|$))+/gm.test(block))
                {
                    block = this.list(block, (block.search(/( {1,3})?\d\./) == 0 ? 'ol' : 'ul'));
                }

                if(/^(<(strong|em|img|a)|[^<])/g.test(block))
                {
                    block = '<p>' + block + '</p>'
                }

                blocks[i] = this.unescapeSpecialChars(block);
            }

            return blocks.join('');
        },

        unescapeSpecialChars: function(string){
            return string.replace(/\\(\\|`|\*|_|\{|\}|\[|\]|\(|\)|#|\+|-|!)/g, '$1');
        },

        list: function(string, tag){
            var list = '';
            var items = string.split('\n');

            for(var i in items)
            {
                list += '<li>' + items[i].replace(/^(( {1,3})?(\d\.|[\*|\+|-])( *|[\t])?)+/g, '') + '</li>';
            }

            return '<' + tag + '>' + list + '</' + tag +'>';

        },

        heading: function(string) {
            var sharpes = '######';
            for(var i=5;i>=0;i--)
            {
                if(string.indexOf(sharpes) === 0)
                {
                    return '<h' + (i+1) + '>' + string.substring(i+1) + '</h' + (i+1) + '>';
                }

                sharpes = sharpes.substring(0, i);
            }
        }
    };

    // expose the downatello variable to the global scope
    window.downatello = {

        /**
         * Convert HTML to MARKDOWN
         * @param {Element} html
         */
        toMarkdown: function(html) {
            MarkdownEngine.source = html;
            return MarkdownEngine.markdownify(html).replace(/\s+$/,'');

        },

        /**
         * Convert MARKDOWN to HTML
         * @param {String} markdown
         * @return {String}
         */
        toHtml: function(markdown) {
            return HtmlEngine.htmlize(markdown);
        }
    };

}(window));
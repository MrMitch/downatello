/**
 * downatello
 */

(function(window, undefined){

    var utils = {
        sanitize: function(string){
            return string.replace(/\\\*/g, '&#42;').replace(/\\_/, '&#95;');
        }
    };


    // HTML ENGINE
    var HtmlEngine = {
        element: Node.ELEMENT_NODE,
        text: Node.TEXT_NODE,
        listDepth: -1,

        tags: {
            blocks: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'ol', 'ul', 'li', 'header', 'nav',
                'aside', 'article', 'footer', 'br', 'hr', 'pre'],
            inlines: ['a', 'em', 'i', 'strong', 'b', 'u', 'code', 'img', 'span']
        },

        isBlock: function(elem) {
            if(elem == null || elem.nodeType == this.text)
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
         *   \   backslash
         *   `   backtick
         *   *   asterisk
         *   _   underscore
         *   {}  curly braces
         *   []  square brackets
         *   ()  parentheses
         *   #   hash mark
         *   +   plus sign
         *   -   minus sign (hyphen)
         *   .   dot
         *   !   exclamation mark
         */
        escapeSpecialChars: function(string) {
            return string.replace(/(\\|`|\{|\}|\[|\]|\(|\)|#|\+|-|!)/g, '\\$1')
                .replace(/\*/g, '&#42;').replace(/_/g, '&#95;')
                .replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&(?!(amp|lt|gt|#(42|95));)/g, '&amp;');
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

                    if(elem.nodeType == this.text)
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
                            if(previous && next && this.isInline(previous) && this.isInline(next)
                                && previous.parentNode != this.source && previous.parentNode != this.source)
                            {
                                markdown += ' ';
                            }
                            else
                            {
                                empty = true;
                            }
                        }
                    }
                    else if(elem.nodeType == this.element)
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
                                this.listDepth++;
                                markdown += this.list(elem, elem.tagName.toLowerCase() == 'ol');
                                this.listDepth--;
                                break;
                            case 'br':
                                break;
                            case 'hr':
                                markdown += '- - -';
                                break;

                            case 'h1':
                                markdown += '# ' + this.markdownify(elem);
                                break;
                            case 'h2':
                                markdown += '## ' + this.markdownify(elem);
                                break;
                            case 'h3':
                                markdown += '### ' + this.markdownify(elem);
                                break;
                            case 'h4':
                                markdown += '#### ' + this.markdownify(elem);
                                break;
                            case 'h5':
                                markdown += '##### ' + this.markdownify(elem);
                                break;
                            case 'h6':
                                markdown += '###### ' + this.markdownify(elem);
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
                    if(parent == this.source && !empty)
                    {
                        markdown += '\n\n';
                    }
                }
            }

            return markdown;
        },

        list: function(elem, ordered) {
            var markdown = '', len = elem.children.length;

            for(var i=1; i<=len; i++)
            {
                for(var j=0; j<4*this.listDepth; j++)
                {
                    markdown += ' ';
                }

                markdown += (ordered ?  i + '.' : '*') + ' ' + this.markdownify(elem.children[i-1])
                    + ((i == len) ? '' : '\n');
            }

            return markdown;
        }
    };

    // MARKDOWN ENGINE
    var MarkdownEngine = {

        htmlize: function(string){
            var blocks = string.split('\n\n');
            var block;

            for(var i in blocks)
            {
                block = utils.sanitize(blocks[i]);

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
                            +'>' + (arguments[2] ? arguments[2] : arguments[4]) + '</a>';
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
                    return '<h' + (i+1) + '>' + string.replace(/^#{1,6}( |\t)*/g, '') + '</h' + (i+1) + '>';
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
         * @return {String}
         */
        toMarkdown: function(html) {
            HtmlEngine.source = html;
            HtmlEngine.listDepth = -1;

            return HtmlEngine.markdownify(html).replace(/\s+$/,'');
        },

        /**
         * Convert MARKDOWN to HTML
         * @param {String} markdown
         * @return {String}
         */
        toHtml: function(markdown) {
            return MarkdownEngine.htmlize(markdown);
        }
    };

}(window));
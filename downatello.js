/**
 * downatello
 */

(function(window, undefined){

    var _downatello = {};

    var debug = true;

    if(!debug)
    {
        console.log = console.debug = console.warn = console.error = console.group = console.groupEnd = function(){return;}
    }

    var core = {
        element: Node.ELEMENT_NODE,
        text: Node.TEXT_NODE,

        tags: {
            blocks: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'ol', 'ul', 'li', 'header', 'nav',
                'aside', 'article', 'footer', 'br', 'hr'],
            inlines: ['a', 'em', 'i', 'strong', 'b', 'u', 'code', 'img', 'span']
        },

        isBlock: function(elem) {
            if(elem == null)
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
                .replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

                    console.group( (elem.tagName ? elem.tagName.toLowerCase() : 'textNode') );
                    console.debug(elem);

                    if(elem.nodeType == core.text)
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
                            if(previous && next && core.isInline(previous) && core.isInline(next))
                            {
                                markdown += ' ';
                            }
                            else
                            {
                                empty = true;
                            }
                        }
                    }

                    else if(elem.nodeType == core.element)
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
                                    markdown += (number ?  j + '. ' : '* ') + this.markdownify(elem.children[j-1])
                                        + ((j == len) ? '' : '\n');
                                }
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
                    if(parent == core.source && !empty)
                    {
                        markdown += '\n\n';
                    }

                    if(empty)
                    {
                        console.warn('empty');
                        console.log(' ');
                    }

                    console.groupEnd();
                }
            }

            return markdown;
        },

        htmlify: function(markdown) {

        }
    };

    /**
     * Convert HTML to MARKDOWN
     * @param {Element} html
     */
    _downatello.toMarkdown = function(html) {

        core.source = html;
        return core.markdownify(html).replace(/\s+$/,'');

    };






    // expose the downatello variable to the global scope
    window.downatello = _downatello;

}(window));
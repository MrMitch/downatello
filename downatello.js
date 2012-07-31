/**
 * downatello
 */

(function(window, undefined){

    var _downatello = {

        tags: {
            blocks: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'p', 'pre', 'blockquote', 'ol', 'ul', 'li'],
            inlines: ['a', 'em', 'i', 'strong', 'b', 'u', 'code', 'img']
        },

        isBlock: function(elem) {
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
            var tag = elem.tagName.toLowerCase();
            for(var i in this.tags.inlines) {
                if(tag == this.tags.inlines[i])
                {
                    return true;
                }
            }
            return false;
        }
    };

    var core = {
        unindent: function(string) {
            //return string.replace(/^((\n|\s)+(\n|\s)*)(.*)((\n|\s)+(\n|\s))*/g, '$4');
            return string.replace(/^\s{2,}/, '').replace(/^\n/, '').replace(/\s+$/, ' ');
        },

        escapeQuotes: function(string) {
            return string.replace(/"/, '\\"');
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
        },

        emphasis: function(string){
            return '_' + this.escapeSpecialChars(string) + '_';
        },
        bold: function(string) {
            return '**' + this.escapeSpecialChars(string) + '**';
        },

        markdownify: function(html) {
            var markdown = '';
            var error;
            var empty;
            var elem;
            var parent;


            if(html.childNodes.length > 0)
            {
                for(var i = 0; i< html.childNodes.length; i++)
                {
                    error = false;
                    empty = false;
                    elem = html.childNodes[i];

                    if(elem.nodeType == Node.TEXT_NODE)
                    {
                        if(/\S+/g.test(elem.textContent))
                        {
                            markdown += this.unindent(this.escapeSpecialChars(elem.textContent));
                        }
                        else
                        {
                            empty = true;
                        }
                    }

                    else if(elem.nodeType == Node.ELEMENT_NODE)
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
                                markdown += '# ' + this.escapeSpecialChars(elem.textContent);
                                break;
                            case 'h2':
                                markdown += '## ' + this.escapeSpecialChars(elem.textContent);
                                break;
                            case 'h3':
                                markdown += '### ' + this.escapeSpecialChars(elem.textContent);
                                break;
                            case 'h4':
                                markdown += '#### ' + this.escapeSpecialChars(elem.textContent);
                                break;
                            case 'h5':
                                markdown += '##### ' + this.escapeSpecialChars(elem.textContent);
                                break;
                            case 'h6':
                                markdown += '###### ' + this.escapeSpecialChars(elem.textContent);
                                break;

                            // inlines
                            case 'img':
                                markdown += '![' + this.escapeSpecialChars(elem.alt) + ']('
                                    + this.escapeSpecialChars(elem.src)
                                    + (elem.title ? '"' + this.escapeSpecialChars(elem.title) + '"' : '') +  ')';
                                break;
                            case 'a':
                                markdown += '[' + this.escapeSpecialChars(elem.href) + ']('
                                    + this.escapeSpecialChars(elem.textContent) + ')';
                                break;

                            case 'b':
                            case 'strong':
                                markdown += this.bold(elem.textContent);
                                break;

                            case 'em':
                            case 'i':
                                markdown += this.emphasis(elem.textContent);
                                break;
                            case 'span':
                                //console.debug(elem);
                                markdown += ''; // handle style attribute
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
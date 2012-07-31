# downatello

*downatello* is a javascript library designed to provide a bridge between HTML markup and MARDOWN markup.
It allows to convert from HTML to MARKDOWN and from MARDOWN to HTML.


# Usage

To use *downatello* in your web pages/applications, include the the ```downatello.js``` file:

```html
<script type="text/javascript" src="/assets/js/downatello.js"></script>
```

and use the ```downatello``` variable in your javascript code.

# Methods

## ```downatello.toMarkdown()```

Use ```downatello.toMarkdown()``` to convert HTML markup to MARKDOWN markup.

Example: 

```html
<p id="html">This text will be translated to <strong>MARKDOWN</strong>.</p>

<script type="text/javascript">
var html = document.getElementById('html');
var markdown = downatello.toMarkdown(html);

console.log(markdown);

// This text will be translated to **MARKDOWN**.
</script>
```

## ```downatello.toHtml()```

Use ```downatello.toHtml()``` to convert MARKDOWN markup to HTML markup.

Example

```html
<script type="text/javascript">
var html = downatello.toHtml('This text has been translated from **MARKDOWN**.');
console.log(html);

// <p>This text will has been translated from <strong>MARKDOWN</strong>.</p>
</script>
```

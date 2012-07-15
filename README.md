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
<script type="text/javascript">
var markdown = downatello.toMardown('<p>This text will be translated to <strong>MARDOWN</strong>.</p>');
console.log(mardown);

// This text will be translated to **MARKDOWN**.
</script>
```

## ```downatello.toHtml()```

Use ```downatello.toHtml()``` to convert MARKDOWN markup to HTML markup.

Example

```html
<script type="text/javascript">
var html = downatello.toHtml('This text will be translated to **MARDOWN**.');
console.log(mardown);

// <p>This text will be translated to <strong>MARKDOWN</strong>.</p>
</script>
```

<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
Here is one mermaid diagram:

```mermaid
flowchart LR
    id
```

<div class="mermaid">
flowchart LR
    id
</div>

<script>
    var config = {
        startOnLoad: true,
        theme: 'forest',
        flowchart: {
            useMaxWidth: false,
            htmlLabels: true
        }
    };
    mermaid.initialize(config);
    // mermaid.init(undefined, 'pre[lang=mermaid] > code')
    mermaid.init(undefined, 'pre > code')
</script>

<a href="https://github.com/magne/nextjs-blog/blob/main/header.svg">
  <img src="header.svg" width="800" height="400" alt="Click to see the source">
</a>

---
title: New Section Checklist
createdAt: 2023-09-17
updatedAt: 2023-10-07
---
1. Copy directory structure from starter template
        ```sh
        cp -r .\starters\section\ .\web\glances
        ```
2. Rename copied `section-index.md` to `<section_name>-index.md`
3. Add rewrite to `Caddyfile`
    ```
    rewrite /<new-section>/* /<new-section>/index.html
    ```
4. Reload Caddy config
5. Add section to Homepage and Nav
6. Add new content to `/<new-section>/markdown` (see new post starter)

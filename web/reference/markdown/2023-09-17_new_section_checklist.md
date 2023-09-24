---
title: New Section Checklist
createdAt: 2023-09-17
lastUpdated: 2023-09-17
---
1. Add new directory structure
        ```
        /<new-section>/markdown
        ```
2. Copy `index.html` into `/<new-section` and update section
    ```
    {{ "{{ $section := \"<new-section>\" }}" }}
    ```
3. Add rewrite to `Caddyfile`
    ```
    rewrite /<new-section>/* /<new-section>/index.html
    ```
4. Reload Caddy config
5. Add section to Homepage and Nav
6. Add new content to `/<new-section>/markdown`

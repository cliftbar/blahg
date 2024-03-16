{{- $section := (first .Args) -}}
---
title: {{ $section | title }} Index
---
## Section Posts
{{ range (listFiles (printf "%s/markdown" $section) | sortAlpha | reverse) }}
{{ if not (contains "index" .) }}
{{ $markdownFile := (include (printf "/%s/markdown/%s" $section .) | splitFrontMatter) }}
{{ if not (default false $markdownFile.Meta.draft) }}
- [{{ $markdownFile.Meta.title }}]({{ . | trimSuffix ".md" }}.html)
{{ end }}
{{ end }}
{{ end }}

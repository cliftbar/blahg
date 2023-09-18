{{ $section := (first .Args) }}
---
Title: {{ $section | title }} Index
---

{{ $section := (first .Args) }}
{{ range (listFiles (printf "%s/markdown" $section) | sortAlpha | reverse) }}
{{ if not (contains "index" .) }}
{{ $markdownFile := (include (printf "/%s/markdown/%s" $section .) | splitFrontMatter) }}
{{ if not (default false $markdownFile.Meta.draft) }}
- [{{ $markdownFile.Meta.Title }}]({{ . }})
{{ end }}
{{ end }}
{{ end }}
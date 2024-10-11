{{ $pathPart := "/img/satellite/2024/mt-hood"}}
{{ $targetName := "Mt. Hood" }}
{{ $files := (listFiles $pathPart | sortAlpha | reverse) }}
{{ $updated := index (splitList "T" (index $files 0)) 0 }}
---
title: {{ $targetName }} Satellite 24/25
createdAt: 2024-09-28
updatedAt: {{ $updated }}
draft: false
---
{{- range $files -}}
    {{- if not (contains "thumbnail" .) -}}
        {{ $fibase := trimSuffix ".png" . }}
        {{- $date := index (splitList "T" .) 0 -}}

## {{ printf $date }}
[![]({{$pathPart}}/{{$fibase}}_thumbnail.png)]({{$pathPart}}/{{$fibase}}.png "{{ $targetName }} {{ $date }}")
    {{ end }}
{{ end }}
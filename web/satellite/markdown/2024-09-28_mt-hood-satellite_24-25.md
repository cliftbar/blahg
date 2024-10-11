{{ $pathPart := "mt-hood"}}
{{ $targetName := "Mt. Hood" }}
{{ $files := (listFiles (printf "/img/satellite/2024/%s" $pathPart) | sortAlpha | reverse) }}
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
[![](/img/satellite/2024/{{$pathPart}}/{{$fibase}}_thumbnail.png)](/img/satellite/2024/{{$pathPart}}/{{$fibase}}_.png "{{ $targetName }} {{ $date }}")
    {{ end }}
{{ end }}
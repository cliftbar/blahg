---
title: Go Embedded FS
createdAt: 2022-06-26
lastUpdated: 2023-09-17
---

Declare and embed files and directories, these are available everywhere  in `main.go` at least

```go
// Put this in main.  the embed keys off the //go:embed comment
var (
    //go:embed static
    staticEmbed embed.FS

    //go:embed templates/*
    templatesEmbed embed.FS

    //go:embed  file.yaml
    aFile []byte

    //go:embed  app.yaml
    defaultConf []byte
)
```

and an example of a Go Gin server loading template files and static assets either from the EmbeddedFS or source files.  This is because when just loading from the EmbeddedFS, changes to assets require a rebuild of the binary (since they're, well, embedded in the binary); loading from source files just means a browser refresh

```go
// /templates
//     -> *.html
// /static
//     /css
//         -> *.css

if conf.Data.Server.Mode == "dev" {
    // Load directly, not from Embedded FS
    router.LoadHTMLGlob("templates/*")   
    router.Static("/static", "./static")
} else {
    templ := template.Must(template.New("").ParseFS(
        templatesEmbed, "templates/*.html"
    ))
    router.SetHTMLTemplate(templ)
    staticFS, _ := fs.Sub(staticEmbed, "static")
    router.StaticFS("/static", http.FS(staticFS))
}
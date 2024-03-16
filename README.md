# Caddy Site README

## web folder
The `web` folder holds the Site content.  Items outside this folder are not accessible via http.

### Site Config
`site.json` contains some configuration for the Site, primarily for generating Feeds.  If a section isn't included `rss-sections, it will not have a Feed generated for it.

### Sections
To create a new section, copy the `section` starter to the web directory and give it a new name.  At a minimum, a directory must have an `index.html` file to be considered a section.  The name of the directory will match the url path, so a directory named `Updates` will be accessible at the path `http://example.com/Updates`.  `<new-section>/markdown/<section-name>-index.md` is optional, and adds content to the section landing page.  New posts are added to `<new-section>/markdown/`.

### Posts
A starter post is available in the starters directory
#### Files
Post file names are used for the url path.  Follow the format `<date>_<post_name>.md`.
#### Contents
The first section of the post is the front matter.  At minimum, a post should have `title`, `createdAt`, and `updatedAt`.  `createAt` and `updatedAt` should be in the format `YYYY-MM-DDThh:mm:ssZ`, although the time is not required, `YYYY-MM-DD` is sufficient.  In general, `createdAt` should match the date in the filename.  `updatedAt` determines the order of the post in Feeds, so a newly updated Post will appear at the top of the Feed.

Post front matter can also specify `draft: true` to make the post inaccessible via http.

### includes
This isn't a special directory, but holds html snippets that can be included into other html files.  Include these as below
```
{{ include "/includes/nav.html" }}
```

### templates
Used by Caddy to generate pages, generally don'y touch

### favicons
Place favicons into the `web` directory as normal

### Feeds
`rss.xml`, `atom.xml`, and `feed.json` generate Feeds, accessible at:
- RSS: `http://example.com/rss.xml`
- RSS: `http://example.com/atom.xml`
- RSS: `http://example.com/feed.json`

Generally these shouldn't be touched.

### Misc Directories
Other directories, such as css or img, can be access by url as normal.  so `dir/subdir/img.png` is available at the url `http://example.com/dir/subdir/img.png`.  These directories and files can also be referenced in Markdown.  So these can largely be organized in any fashion.

## utils
Two python utilities are available for resizing images and running a load tests.  Refer to code for usage.

## License
The default licensing is [CC BY-NC-SA 4.0](https://www.tldrlegal.com/license/creative-commons-attribution-noncommercial-sharealike-4-0-international-cc-by-nc-sa-4-0) for content and [AGPL 3.0](https://www.tldrlegal.com/license/gnu-affero-general-public-license-v3-agpl-3-0) for the other code.

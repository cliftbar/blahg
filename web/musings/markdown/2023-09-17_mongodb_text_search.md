---
title: MongoDB Text Search
createdAt: 2022-06-15
lastUpdated: 2023-09-17
---
MongoDB supports text search in a few ways of varying efficiency.  See the matrix below for a quick overview, and further discussions for details.  Java code is using [Morphia](https://morphia.dev/landing/index.html)

| Method                                                            | Search Type | Index Usage                   | Case        |
| ----------------------------------------------------------------- | ----------- | ----------------------------- | ----------- |
| [General Regex](#general-regex)                                   | substring   | No                            | Either      |
| [Prefix Regex](#prefix-regex)                                     | prefix      | Yes                           | Sensitive   |
| [Prefix Regex (Case Insensitive)](#prefix-regex-case-insensitive) | prefix      | No                            | Insensitive |
| [Text Search](#text-search)                                       | Whole Word  | Yes (text index)              | Either      |
| [Bounded-String Prefix](#bounded-string-prefix-search)            | Prefix      | Yes (with dedicated settings) | Insensitive |


## General Regex
This is the “naive” approach to text search.  It is the most flexible, just define a regex with your search string and go.  But it cannot utilize an index, you’ve got a full table scan every query.  This doesn’t scale well, and isn’t generally preferred.

### MongoDB Query
```javascript
{"field": {$regex: /^term/}}
```

### Java Code
```java
String search = "term";
Pattern regex = Pattern.compile(Pattern.quote(search));
query.criteria("field").equal(regex)
```

## Prefix Regex
This is currently my go-to method for text search.  It’s restricted to prefix only searches and is case sensitive, but it can utilize a standard index without much effort in code.  See MongoIdentifyStorageDAO for an example.  Note the ^ in the query, that’s the regex piece that makes the search term a “prefix” search.  Otherwise, it's just a General Regex search.

### MongoDB Query

```javascript
{"field": {$regex: /^term/}}
```

### Java code
```java
String search = "term";
Pattern prefixRegex = Pattern.compile("^"+Pattern.quote(search));
query.criteria("field").equal(prefixRegex)
```

## Prefix Regex (Case Insensitive)
A prefix regex (or general regex for that matter) can be made case-insensitive.  However, that removes it’s ability to utilize an index, so that makes it similar to the General Regex in that its not preferred. The i in the query converts it to a case-insensitive search.

### MongoDB Query
```javascript
{"field": {$regex: /^term/i}}
```

### Java Code
```java
String search = "term";
Pattern prefixRegex = Pattern.compile("^" + Pattern.quote(search), Pattern.CASE_INSENSITIVE);
query.criteria("field").equal(prefixRegex)
```

## Text Search
MongoDB’s “official” text search support utilizes a specific Text Index.  It is efficient, but only works for whole word matching.  I haven't tried this out yet, so no Java example.

### MongoDB Query
```javascript
{"field": {$text: {$search: "word"}}}
```

## Bounded String Prefix Search
This is the most complicated search on the list, but it’s the way to get Prefix searches that are case-insensitive utilizing an index.  It works by using comparison operators to find all strings between the search term and term\uFFFF.  \uFFFF is the “largest” character value, so when using string sorting, this is effectively a search for term plus any combination of characters.  This is likely slightly less efficient than a Prefix Regex, since it needs to do two comparison operations rather than a single regex operation, but still much better than ignoring indexes.

Both the index used and the query need to specify some specific collation options for this to work:  The locale needs to be set (I'm using `en`, until there’s a reason not to), and the Collation Strength needs to be set to secondary (which indicates that case should be ignored).  This means the index is effectively dedicated to the search query, since queries that don’t specify the same collation settings will ignore the search index.

Also an interesting note, the query analyzer in MongoDB Compass appears to not be able to deal with the \uFFFF character and doesn’t display things properly. Use mongo shell to generate query plans.

### MongoDB CLI Query with Explain
```javascript
db.MyCollection.explain("executionStats") \
.find({"$and":[{"field":{"$gte":"term"}},{"field":{"$lt":"term\uFFFF"}}]}) \
.collation( { locale: "en", strength: 2 } )
```
### Java Code

#### Index Creation
```java
@Index(
    fields = {@Field("Field")},
    options = @IndexOptions(collation = @Collation(
        locale = "en",
        strength = CollationStrength.SECONDARY
    ))
)
```
#### Query
```java
FindOptions opts = new FindOptions();
Query<MongoAttribute> query = _delegate.createQuery();

String searchPrefix = "term";
String searchPrefixUpperBound = searchPrefix + Character.MAX_VALUE;

query = query
    .field("field").greaterThanOrEq(searchPrefix)
    .field("field").lessThan(searchPrefixUpperBound);

// Search must use specific collation settings
Collation searchCollation = Collation.builder().locale("en")
    .collationStrength(CollationStrength.SECONDARY).build();
opts.collation(searchCollation);

List<T> result = query.find(opts).toList();
```
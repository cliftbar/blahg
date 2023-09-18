---
Title: Useful Commands
section: reference
createdAt: 2023-08-15
lastUpdated: 2023-08-15
---
## Redis
### Clear key cache
- `redis-cli -p 6378 -a 'password' --raw keys 'lr:tok:*' | xargs redis-cli -p 6378 -a 'password' del`


## Mongo
### Delete unit test DBs
```js
db.adminCommand("listDatabases").databases.forEach( function (d) {
    if (d.name.includes("test_")) {
        print(d.name);
        db.getSiblingDB(d.name).dropDatabase();
    }
})
```
```shell
mongo --eval 'db.adminCommand("listDatabases").databases.forEach( function (d) {
    if (d.name.includes("test_")) {
        print(d.name);
        db.getSiblingDB(d.name).dropDatabase();
    }
})'
```

### Find and remove index of unknown location
```js
db.getCollectionNames().forEach(coll =>
    {
        const col_obj = db.getCollection(coll);
        indexes = col_obj.getIndexes();
        let found = indexes.filter(i=> i.name === 'lastUpdated_1');
        if (found.length > 0) {
            print("Found on " + coll + ":");
            printjson(found);
            found.forEach(f => col_obj.dropIndex(f.name));  //drop the index
        }

});
```

### Mongo Query Explains
```js
function quick_explain(explainPlan) {
  var stepNo = 1;
  var printInputStage = function(step) {
    if ("inputStage" in step) {
      printInputStage(step.inputStage);
    }
    if ("inputStages" in step) {
      step.inputStages.forEach(function(inputStage){
        printInputStage(inputStage);
      });
    }
    if ("indexName" in step) {
      print(stepNo++, step.stage, step.indexName);
    } else {
      print(stepNo++, step.stage);
    }
  };
  printInputStage(explainPlan);
}
```

```js
function executionStats(execStats) {
  var stepNo = 1;
  print('\n');
  var printSpaces = function(n) {
    var s = '';
    for (var i = 1; i < n; i++) {
      s += ' ';
    }
    return s;
  };
  var printInputStage = function(step, depth) {
    if ('inputStage' in step) {
      printInputStage(step.inputStage, depth + 1);
    }
    if ('inputStages' in step) {
      step.inputStages.forEach(function(inputStage) {
        printInputStage(inputStage, depth + 1);
      });
    }
    var extraData = '(';
    if ('indexName' in step) extraData += ' ' + step.indexName;
    if ('executionTimeMillisEstimate' in step) {
      extraData += ' ms:' + step.executionTimeMillisEstimate;
    }
    if ('keysExamined' in step)
       extraData += ' keys:' + step.keysExamined;
    if ('docsExamined' in step)
       extraData += ' docs:' + step.docsExamined;
    extraData += ')';
    print(stepNo++, printSpaces(depth), step.stage, extraData);
  };
  printInputStage(execStats.executionStages, 1);
  print(
    '\nTotals:  ms:',
    execStats.executionTimeMillis,
    ' keys:',
    execStats.totalKeysExamined,
    ' Docs:',
    execStats.totalDocsExamined
  );
}
```

## Power delete current directory
```shell
# Better option with `find` exists below
# commands are dangerous!
fd -tf --threads=32 --exec  rm {}
find . -delete
```
```shell
for i in {0..520}
do
   echo "Deleting $i dir"
   fd -tf . "$i/" --threads=32 --exec  rm {}
done
```

## Mongo Backup/Restore

```shell
mongoexport --uri 'mongodb://localhost' --db main --collection targetCollection --out PatchToApply.json
mongoimport --numInsertionWorkers=32 --mode=upsert --uri 'mongodb://localhost' --db main --collection targetCollection PatchToApply.json
mongoimport --numInsertionWorkers=32 --mode=upsert --uri 'mongodb://localhost' --db main --collection targetCollection --mode=upsert --upsertFields=f1,f2,f3,key NoIdNoMongoPatchToApply.json
mongoimport --numInsertionWorkers=32 --mode=upsert --uri 'mongodb://localhost' --db main --collection targetCollection PatchToApply.json
```

## Monitor metrics endpoint
```shell
netcat -u -l -p 8125 localhost
```

## Caddy local https
```caddyfile
{
    local_certs
    debug
}
https://127.0.0.1:5001 {
    reverse_proxy {
    to http://127.0.0.1:5000
    #tls_insecure_skip_verify
    #transport http {
#     tls internal
    #tls_insecure_skip_verify
  #}
}
}
```
```shell
caddy run --config http.caddyfile --adapter caddyfile
```

## Kill application on Port
```shell
kill -9 $(lsof -ti:3000)
```
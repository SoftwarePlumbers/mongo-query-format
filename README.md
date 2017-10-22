# ![Software Plumbers](http://docs.softwareplumbers.com/common/img/SquareIdent-160.png) Query Formatter for MongoDB

A Query Formatter that allows abstract-query users to create queries properly formatted for MongoDB

## Example

```javascript

let query = Query
    		.from({ a: "23", b: [2,4]})
    		.or({ a: "24", b: [1,16]})
    		.toExpression(Formatter.MONGO);
```

and query should equal:

```
{"$or":[
    {"$and":[
        {"a":"23"},
        {"$and":[
            {"b":{"$gte":2}},
            {"b":{"$lt":4}}
        ]}
    ]},
    {"$and":[
        {"a":"24"},
        {"$and":[
            {"b":{"$gte":1}},
            {"b":{"$lt":16}}
        ]}
    ]}
]}
```

which while a trifle long-winded should be a valid mongo query document.

For the latest API documentation see [The Software Plumbers Site](http://docs.softwareplumbers.com/mongo-query-format/master)

## Project Status

Beta. The API is stabilising, and although unit test coverage could be better it seems broadly functional.



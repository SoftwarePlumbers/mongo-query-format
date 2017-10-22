const { MONGO } = require('../src/formatter');
const { Query } = require('abstract-query');
const chai = require('chai');
const debug = require('debug')('mongo-query-format~tests');
const expect = chai.expect;


describe('Range', () => {

    it('formats a simple query', () => { 
    	let query = Query.from({ a: "23", b: [2,4]}).toExpression(MONGO);
    	expect(query).to.deep.equal({$and: [{ "a": "23" }, { $and: [{ "b": { $gte: 2 } }, { "b": { $lt: 4 } }] }]});
    });

    it('formats another simple query', () => { 
        let query = Query.from({ a: "23", b: [2,]}).toExpression(MONGO);
        expect(query).to.deep.equal({ "a": "23", "b": { $gte: 2 } });
    });

    it('formats an or query', () => { 
    	let query = Query
    		.from({ a: "23", b: [2,4]})
    		.or({ a: "24", b: [1,16]})
    		.toExpression(MONGO);

    	expect(query).to.deep.equal({$or: [{ $and: [{ "a": "23" }, { $and: [{ "b": { $gte: 2 } }, { "b": { $lt: 4 } }] }] }, { $and: [{ "a": "24" }, { $and: [{ "b": { $gte: 1 } }, { "b": { $lt: 16 } }] }] }]});
    });

    it('formats a subquery', () => { 
    	let query = Query
    		.from({ a: "23", b: { c: 4, d: 2}})
    		.toExpression(MONGO);

    	expect(query).to.deep.equal({$and: [{ "a": "23"}, { "b.c": 4, "b.d": 2 }] });
    });

    it('formats a query on an array element', () => { 

    	let query = Query
    		.from({ a: "23", b: { $has : "bongo" } } )
    		.toExpression(MONGO);

    	expect(query).to.deep.equal({ "a": "23", b: { $elemMatch: { $eq: "bongo" } } });
    });

    it('formats a query on a multiple array elements', () => { 

    	let query = Query
    		.from({ a: "23", b: { $hasAll : ["bongo", "bingo"] } } )
    		.toExpression(MONGO);

    	expect(query).to.deep.equal(
    		{
    			$and: [
    				{ "a": "23" }, 
    				{ $and: [
    						{ b: { $elemMatch: { $eq: "bongo" } } }, 
    						{ b: { $elemMatch: { $eq: "bingo" } } }
    					]
    				} 
    			]
    		}
    	);
    });

    it('formats a query on a array of documents', () => { 

    	let query = Query.from({ a: "23", b: { $has : { drumkit: "bongo" } } } );

    	debug(JSON.stringify(query));

    	let expression = query.toExpression(MONGO);

    	expect(expression).to.deep.equal(
    		{
    			"a": "23", 
    		    b: { $elemMatch: { drumkit: "bongo" } } 
    		}
    	);
    });

    it ('formats example for README.md', () => {
        let query = Query
            .from({ a: "23", b: [2,4]})
            .or({ a: "24", b: [1,16]})
            .toExpression(MONGO);

        let result = 
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
            ]};

        expect(query).to.deep.equal(result);

    });

 });
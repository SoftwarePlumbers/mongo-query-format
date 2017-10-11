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

    	expect(query).to.deep.equal({$and: [{ "a": "23" }, { b: { $elemMatch: { $and: [{ "c": 4 }, { "d": 2 }] } } }]});
    });
 });
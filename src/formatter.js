const { Query } = require('abstract-query');


/** private */
function printDimension(context, name) {
	return name;
}

/** private */
function printValue(value) {
	if (typeof value === 'number') return value;
	return `"${value}"`
}

/** private */
function printOperator(operator, value) {
	switch(operator) {
		case '>'  : return `{ $gt: ${printValue(value)} }`;
		case '<'  : return `{ $lt: ${printValue(value)} }`;
		case '>=' : return `{ $gte: ${printValue(value)} }`;
		case '<=' : return `{ $lte: ${printValue(value)} }`;
		case '='  : return printValue(value);
	}	
}

/** Format a Query as a MongoDB Query */
class Formatter {

	/** Create an and expression 
	* @param ands {Array} A chain of and operations
	* @returns {string} A string representing the chain of and operations.
	*/
    andExpr(...ands) { 
    	return "$and: [" + ands.map(and=>`{ ${and} }`).join(', ') + "]"
    }

	/** Create an or expression 
	* @param ors {Array} A chain of or operations
	* @returns {string} A string representing the chain of or operations.
	*/
    orExpr(...ors) { 
    	return "$or: [" + ors.map(or=>`{ ${or} }`).join(', ') + "]"
    }

	/** Create an operation expression 
	* @param dimension {string} name of field on which operation is taking place
	* @param operator {string} name of operation
	* @param value {Object} parameter for operation
	* @param context {Context} context (used in subqueries)
	* @returns {string} A string representing the operation
	*/
    operExpr(dimension, operator, value, context) {
    	if (operator === 'contains')
    		return dimension + ": { $elemMatch: { " + value + " } }"
    	else	
    		return '"' + printDimension(context,dimension) + '": '  + printOperator(operator, value); 
    }

    /** Get a formatter instance */
    static get MONGO() { return INSTANCE; }
}

var INSTANCE = new Formatter();

module.exports = Formatter;
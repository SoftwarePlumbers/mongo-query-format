const { Query } = require('abstract-query');


/** private */
function printDimension(context, name) {
	return name;
}



/** private */
function toOperator(operator, value) {
	switch(operator) {
		case '>'  : return { $gt: value };
		case '<'  : return { $lt: value };
		case '>=' : return { $gte: value };
		case '<=' : return { $lte: value };
		case '='  : return value;
	}	
}

/** Format a Query as a MongoDB Query */
class Formatter {

	/** Create an and expression 
	* @param ands {Array} A chain of and operations
	* @returns {string} A string representing the chain of and operations.
	*/
    andExpr(...ands) { 
    	return { $and: ands }
    }

	/** Create an or expression 
	* @param ors {Array} A chain of or operations
	* @returns {string} A string representing the chain of or operations.
	*/
    orExpr(...ors) { 
    	return { $or: ors }
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
    		return { [dimension] : { $elemMatch: value } };
    	else	
    		return { [dimension] : toOperator(operator, value) }; 
    }

    /** Get a formatter instance */
    static get MONGO() { return INSTANCE; }
}

var INSTANCE = new Formatter();

module.exports = Formatter;
const { Query } = require('abstract-query');
const { Stream } = require('iterator-plumbing');


/** private */
function printDimension(context,name) {
	if (!context || !context.dimension) return name;
	return printDimension(context.context, context.dimension) + "." + name;
}




/** Format a Query as a MongoDB Query 
*
* Use dimension: { $elemMatch: { $eq: "value"} } for fields in array
*
* Use dimension: { $elemMatch: { d1: "value", d2: "value"} } for matching array of subdocuments
*
* Use { "dimension.d1": "value" } for matching fields in straight subdocument (no array)
*
*/
class Formatter {

	/** private */
	toOperator(operator, value, short_equals = true) {
		switch(operator) {
			case '>'  : return { $gt: value };
			case '<'  : return { $lt: value };
			case '>=' : return { $gte: value };
			case '<=' : return { $lte: value };
			case '='  : return short_equals ? value : { $eq: value };
			case 'has' : return { $elemMatch: value };
			case 'hasAll' : return { $elemMatch: value };
			case 'match': return value;
		}	
		throw new RangeError("unknown operator: " + operator)
	}

	/** Create an and expression.
	*
	* Use short form ( { <dimension> : { <oper> : value }, ...} ) if all items in array provided are simple
	* criteria (e.g. { <dimension> : { <oper> : value } } ) and all dimension values are unique. Otherwise
	* revert to long form { $and: [ { <dimension> : { <oper> : value } }, ... ]}.
	*
	* @param ands {Array} A chain of and operations
	* @returns {Object} An object representing the chain of and operations.
	*/
    andExpr(...ands) { 
    	let result = {};

    	// Build a short-form object but set to null if we find an item in 'ands' that does not meet requirements.
    	const reduction = (accumulator, item) => {
    		let keys = Object.keys(item);
    		if (keys.length > 1) return null;
    		let dimension = keys[0];
    		if (dimension[0] === "$") return null;
    		if (result[dimension]) return null;
    		accumulator[dimension] = item[dimension];
    		return accumulator;
    	}

    	// Break out of reduce if we find a null 
    	const condition = (accumulator) => accumulator;

    	result = Stream.from(ands).reduce(reduction,result,condition);

    	return result || { $and: ands };
    }

	/** Create an or expression 
	* @param ors {Array} A chain of or operations
	* @returns {Object} An object representing the chain of or operations.
	*/
    orExpr(...ors) { 
    	return { $or: ors }
    }

	/** Create an operation expression 
	* @param dimension {string} name of field on which operation is taking place
	* @param operator {string} name of operation
	* @param value {Object} parameter for operation
	* @param context {Context} context (used in subqueries)
	* @returns {Object} A object representing the operation
	*/
    operExpr(dimension, operator, value, context) {

    	let property = printDimension(context,dimension);

    	if (operator === 'match') return value;

    	if (dimension === null) // inside array 'has' or 'hasAll' clause
    		return this.toOperator(operator, value, false)
    	else	
    		return { [property] : this.toOperator(operator, value) }; 

    }

    /** Get a formatter instance */
    static get MONGO() { return INSTANCE; }
}

var INSTANCE = new Formatter();

module.exports = Formatter;
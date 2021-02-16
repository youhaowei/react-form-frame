// put default callbacks and validations here
const defaultCallbacks = {};

/**
 * Providing fields, return a copy of field with each callbacks of validations
 * and subscriptions replaced with actual callback function instead of the name.
 * @param {oject} fields - <string, object> map where key is the name of the field.
 * @param {object} callbackMaps - extra callback functions
 * 
 * @returns {object} new field
 */
export const replaceFieldCallbacks = (fields, callbackMaps) => {
	if (!fields) {
		throw new Error('fields is a required argument.');
	}
	const getCallback = (name) => {
		if (callbackMaps && callbackMaps[name]) {
			return callbackMaps[name];
		}
		else {
			return defaultCallbacks[name] ?? (
				() => {
					console.error(`callback "${name}" is not defined`);
					// so invalid callback doesn't stop validation
					return true;
				}
			);
		}
	};
	const result = {};
	for (const name in fields) {
		const field = Object.assign({}, fields[name]);
		if (field.subscriptions) {
			field.subscriptions = field.subscriptions.map(sub => {
				return {
					...sub,
					callback: getCallback(sub.callback)
				};
			});
		}
		if (field.validations) {
			const validations = {};
			field.validations.forEach(validation => {
				validations[validation] = getCallback(validation);
			});
			field.validation = validations;
		}
		field.props ??= {};
		result[name] = field;
	}
	return result;
};
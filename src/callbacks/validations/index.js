
import { useDispatch, useStore } from 'react-redux';
import { clearError, setError, updateField, updateFieldProps } from '../../Components/Provider/slice';
import required from './required';

export const validationCallbacks = {
	required
};

const _validateField = async (store, dispatch, name) => {
	const { fields, data } = store.getState();
	if (!fields[name]) {
		console.error(`validation request ignored, field name "${name}" not found.`);
		// return PASS which doesn't prevent form submission
		return true;
	}

	// TODO: return ref to the field so we can perform scroll to the first error
	let result = true;
	for (const validation in fields[name].validations) {
		const { name: validationName, callback, enabled } = fields[name].validations[validation];
		if (!callback) {
			console.error(`missing validation callback for ${validationName}, skipped.`);
		} else if (enabled) {
			// don't need to run all validations if one failed
			result = result && await callback({
				value: data[name],
				data,
				fields,
				field: fields[name],
				updateField: (update) => dispatch(updateField({ name, update })),
				updateFieldProps: (update) => dispatch(updateFieldProps({ name, update })),
				// error code defaults to validation name
				setError: (message, error = validationName) => dispatch(setError({ name, error, message })),
				clearError: (error = validationName) => dispatch(clearError({ name, error }))
			});
		}
	}
	return result;
};


export const useFormValidation = () => {
	const store = useStore();
	const dispatch = useDispatch();
	return {
		validateField: async (name) => await _validateField(store, dispatch, name),
		validateAll: async () => {
			const { fields } = store.getState();
			let result = true;
			for (const fieldName in fields) {
				// run all validations even there is already a failed one.
				result = await _validateField(store, dispatch, fieldName) && result;
			}
			return result;
		}
	};
};


export default validationCallbacks;
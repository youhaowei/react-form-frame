
import { useCallback } from 'react';

const { useStore } = require('react-redux');
const { updateValue, updateField, updateFieldProps, setError, clearError, toggleValidation } = require('../Components/Provider/slice');


const useFieldEvent = (name) => {

	const store = useStore();
	const fireEvent = useCallback((event) => {
		const state = store.getState();
		const dispatch = store.dispatch;
		const subs = state.fields[name]?.subscribers && state.fields[name]?.subscribers[event];
		const { data, fields, meta } = state;
		const subValue = data[name];
		const subField = fields[name];

		subs?.forEach(sub => {
			const ownValue = data[sub.subscriber];
			const ownField = fields[sub.subscriber];
			sub.callback({
				name: sub.name, // name of the callback
				formMetaData: meta,
				store,
				state,
				dispatch,
				data,
				fields,
				ownName: name,
				ownValue,
				ownField,
				subValue,
				subField,
				subName: sub.subscriber,
				staticArgs: sub.args,
				updateValue: (value) => dispatch(updateValue({ name, value })),
				updateField: (update) => dispatch(updateField({ name, update })),
				updateFieldProps: (update) => dispatch(updateFieldProps({ name, update })),
				// error code defaults to callback name
				setError: (message, error = sub.name) => dispatch(setError({ name, error, message })),
				clearError: (error = sub.name) => dispatch(clearError({ name, error })),
				toggleValidation: (validation, enabled) => dispatch(toggleValidation({ name, validation: validation ?? sub.name, enabled }))
			});
		});
	}, [name, store]);
	return fireEvent;
};

export default useFieldEvent;
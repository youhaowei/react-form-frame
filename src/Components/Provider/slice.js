import { createSlice } from '@reduxjs/toolkit';
import validationCallbacks from '../../callbacks/validations';

const INITIAL_STATE = {
	meta: {},
	data: {},
	fields: {},
	errors: [],
	inited: false
};

const formSlice = createSlice({
	name: 'form',
	reducers: {
		init: (state, action) => {
			const { meta = {}, defaultData = {}, fields } = action.payload;
			const newState = { ...INITIAL_STATE };
			newState.meta = meta;
			newState.data = defaultData;
			newState.inited = true;
			newState.errors = [];

			newState.fields = { ...fields };
			// holding subscribers for each fields
			const subs = {};

			/**
			 * internal function for addSub, put sub under field, and corresponding event
			 * @param {*} field 
			 * @param {*} event 
			 * @param {*} sub 
			 */
			const addEventSub = (field, event, sub) => {
				if (!subs[field][event]) {
					subs[field][event] = [];
				}
				subs[field][event].push(sub);
			};

			/**
			 * add subscription object to the temp object subs.
			 * @param {*} sub 
			 */
			const addSub = (sub) => {
				const { event, events = [], to, ...rest } = sub;
				if (!subs[sub.to]) {
					subs[sub.to] = {};
				}

				events.push(event);

				Set(events).forEach(event => addEventSub(to, event, rest));
			};

			for (const name in newState.fields) {
				newState.fields[name].errors ??= {};
				newState.fields[name].name = name;
				newState.fields[name].validations ??= {};
				if (Array.isArray(newState.fields[name].validations)) {
					// transform validations from array into <name, callback> map
					const result = {};
					newState.fields[name].validations.forEach(validation => {
						if (typeof validation === 'string') {
							if (validationCallbacks[validation]) {
								// add system validation if name is found
								result[validation] = validationCallbacks[validation];
							}
						} else {
							if (validation.name && validation.callback) {
								// add custom validation
								result[validation.name] = validation.callback;
							}
						}
					});
				}
				// translate validations from <name, callback> to <name, object>
				for (const validation in newState.fields[name].validations) {
					newState.fields[name].validations[validation] = {
						name: validation,
						enabled: true,
						callback: newState.fields[name].validations[validation]
					};
					if (validation === 'required') {
						newState.fields[name].required = true;
					}
				}

				if (newState.fields[name].required) {
					newState.fields[name].validations.required ??= {
						name: 'required',
						enabled: true,
						callback: validationCallbacks.required
					};
				}

				// prep for subscriber object
				newState.fields[name].subscriptions?.forEach(subscription => {
					subscription.subscriber = name;
					if (Array.isArray(subscription.to)) {
						subscription.to.forEach(to => {
							addSub({
								...subscription,
								to
							});
						});
					} else if (subscription.to) {
						addSub(subscription);
					} else {
						// if to is not specified, it's self subscribed
						addSub({
							...subscription,
							to: name
						});
					}

					// add subscription to validations
					if (subscription.isValidation) {
						newState.fields[name].validations[subscription.name] = {
							name: subscription.name,
							callback: subscription.callback,
							enabled: true
						};
					}
				});
			}

			// move subscribers from temp variable
			for (const name in subs) {
				newState.fields[name].subscribers = subs[name];
			}
			return newState;
		},
		reset: () => INITIAL_STATE,
		// overwrite data[name] with given value
		updateValue: (state, { payload: { name, value } }) => {
			state.data[name] = value;
		},
		// update field[name] with given update, might not affect field renders
		updateField: (state, { payload: { name, update } }) => {
			const field = state.fields[name];
			for (const key in update) {
				field[key] = update[key];
			}
		},
		// update props of the field, will cause field rerender
		updateFieldProps: (state, { payload: { name, update } }) => {
			state.fields[name].props ??= {};
			const props = state.fields[name].props;
			for (const key in update) {
				props[key] = update[key];
			}
		},
		setError: (state, action) => {
			const { name, error, message } = action.payload;
			state.fields[name].errors ??= {};
			state.fields[name].errors[error] = message;
			state.errors = state.errors.filter(e => e.field !== name || e.error !== error);
			state.errors.push({
				field: name,
				error,
				message
			}); // store fields with errors
		},
		clearError: (state, action) => {
			const { name, error } = action.payload;
			delete state.fields[name].errors[error];
			state.errors = state.errors.filter(e => e.field !== name || e.error !== error);
		},
		// this only toggle if future validation would be fired,
		// doesn't clear existing errors caused by the validation
		toggleValidation: (state, action) => {
			const { name, validation, enabled } = action.payload;
			state.fields[name].validations[validation] = enabled ?? !state.fields[name].validations[validation]
				;
		}
	}
});

export const { init, reset, updateValue, updateFieldProps, updateField, setError, clearError, toggleValidation } = formSlice.actions;
export default formSlice;
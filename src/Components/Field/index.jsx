import React, { Suspense, useCallback, useEffect, useState, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { updateValue, updateField, setError, clearError } from '../Provider/slice';
import useFieldEvent from '../../hooks/useFieldEvent';
import { ON_BLUR, ON_CHANGE, ON_LOAD, ON_UPDATE } from '../../events';
import PropTypes from 'prop-types';


const Field = ({ component, name }) => {
	return () => {
		const { value, field } = useSelector((state) => ({
			value: state.data[name],
			field: state.fields[name]
		}), shallowEqual);
		const fireEvent = useFieldEvent(name);
		const dispatch = useDispatch();

		/**
		 * Firing onUpdate and onLoad event
		 */
		const [loaded, setLoaded] = useState(false);

		useEffect(() => {
			if (loaded) {
				fireEvent(ON_UPDATE);
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [fireEvent, value]);

		useEffect(() => {
			if (!loaded) {
				fireEvent(ON_LOAD);
				setLoaded(true);
			}
		}, [fireEvent, loaded]);

		/**
		 * callbacks for dispatches related to the field
		 */
		const updateValue = useCallback((v) => {
			dispatch(updateValue({ name, value: v }));
		}, [dispatch]);

		const updateField = useCallback((update) => {
			dispatch(updateField({ name, update }));
		}, [dispatch]);

		const setError = useCallback((error, message) => {
			dispatch(setError({ name, error, message }));
		}, [dispatch]);

		const clearError = useCallback((error) => {
			dispatch(clearError({ name, error }));
		}, [dispatch]);

		/**
		 * Callbacks for event handling
		 */
		const fireEventAndCallHandler = useCallback((event, ...args) => {
			if (field[event] && typeof field[event] === 'function') {
				field[event](...args);
			}
			fireEvent(event);
		}, [field, fireEvent]);

		const onChange = useCallback((val) => {
			updateValue(val);
			fireEventAndCallHandler(ON_CHANGE);
		}, [fireEventAndCallHandler, updateValue]);

		const onBlur = useCallback((e) => {
			fireEventAndCallHandler(ON_BLUR, e);
		}, [fireEventAndCallHandler]);

		const onClick = useCallback((e) => {
			fireEventAndCallHandler(ON_BLUR, e);
		}, [fireEventAndCallHandler]);


		const fieldProps = useMemo(() => ({
			onChange,
			onBlur,
			onClick,
			updateField,
			setError,
			clearError,
			errors: field.errors,
			error: (field.errors && Object.keys(field.errors).length > 0),
			errorMessage: (field.errors && Object.keys(field.errors).length) ? field.errors[Object.keys(field.errors)[0]] : null,
			type: field.type,
			label: field.label + (field.required ? ' *' : ''),
			...field.props,
			name,
			value
		}),
			[clearError, field.errors, field.label, field.props, field.type, onBlur, onChange, onClick, setError, updateField, value]);
		return field?.hidden ? null :
			<div className='form-frame-field' id={'field-' + name}>
				<Suspense fallback={<p>Loading...</p>}>
					{component ?
						<component {...fieldProps} /> :
						<p>component missing for field {name}</p>
					}
				</Suspense>
			</div>;
	};
};

Field.proptypes = {
	name: PropTypes.string.isRequired,
	component: PropTypes.element
};

export default Field;
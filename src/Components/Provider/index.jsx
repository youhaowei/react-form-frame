import React from 'react';
import { configureStore, getDefaultMiddleware, isPlain } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import formSlice from './slice';
import PropTypes from 'prop-types';

const getStore = () => configureStore({
	reducer: formSlice.reducer,
	devTools: {
		name: 'Form'
	},
	// TODO: use a more flexible event system like RxJS
	middleware: getDefaultMiddleware({
		serializableCheck: {
			isSerializable: (val) => {
				// Functions should not be part of the redux according to some best practices.
				// However, we need function stored in the state to fire appropriate callbacks
				// TODO: use a pubsub library to handle callbacks, which can offload callback functions from redux store
				return typeof val === 'function' || isPlain(val);
			}
		}
	})
});

const FormProvider = ({ children }) => {
	return <Provider store={getStore()}>
		{children}
	</Provider>;
};

FormProvider.propTypes = {
	children: PropTypes.element,
};

export default FormProvider;

export const withForm = (Component) => {
	class WithForm extends React.PureComponent {
		render() {
			return <FormProvider>
				<Component {...this.props} />
			</FormProvider>;
		}
	}
	return WithForm;
};
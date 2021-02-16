
const ERROR_MESSAGE = 'Required';

const required = ({ value, setError, clearError }) => {
	if (value === undefined || value === null || ((typeof value === 'string' || Array.isArray(value)) && value.length === 0)) {
		setError(ERROR_MESSAGE);
		return false;
	} else {
		clearError();
		return true;
	}

};

export default required;
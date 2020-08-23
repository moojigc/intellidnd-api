import { devError } from '../utils/error';

/**
 * Handle setting sessionStorage or locaLStorage
 */
const handleStorage = ({
	session,
	key,
	data,
}: {
	session?: boolean;
	key: string;
	data?: any;
}) => {
	try {
		const storage = session ? sessionStorage : localStorage;
		switch (!!data) {
			case true: {
				storage.setItem(key, JSON.stringify(data));
				return data;
			}
			default: {
				let data = storage.getItem(key);
				return data ? JSON.parse(data) : null;
			}
		}
	} catch (error) {
		devError(error);
	}
};

export default handleStorage;

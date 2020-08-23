import axios, { AxiosRequestConfig } from 'axios';
import { devError } from '../utils/error';

const request = async (options: AxiosRequestConfig) => {
	try {
		const { data } = await axios({
			...options,
			withCredentials: true,
			url: `/api/v1/${options.url}`,
		});
		return data;
	} catch (error) {
		devError(error);
		return {
			flash: {
				message: 'Bad request',
				type: 'error',
			},
		};
	}
};

export default request;

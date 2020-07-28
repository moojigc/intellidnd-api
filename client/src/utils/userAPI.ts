import Axios from 'axios';

type UserAction =
    | 'login'
    | 'register'
    | 'logout'
    | 'user-status'
    | 'reset-pass'
    | 'update-pass'
    | 'verify'
    | 'myprofile';

interface UserDetails {
    username?: string;
	email?: string;
	currentPassword?: string,
    password?: string;
    password2?: string;
}

const request = async (
    action: UserAction,
    details?: UserDetails | null,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    params?: object
) => {
    const getParams = (input: object) => {
		let queryKeys = Object.keys(input);
		let queryValues = Object.values(input);
		return "?" + queryKeys.map((k, i) => {
			return `${k}=${queryValues[i]}`
		}).join("&")
	}
    try {
        let { data } = await Axios({
            url: `/api/user?action=${action}` + params && '/' + getParams((params as object)),
            method: method,
            data: details,
            withCredentials: true
        });
        return data;
    } catch (error) {
        console.error(error);
        return {
            user: { username: 'Guest', id: null, auth: false },
            flash: { message: 'Bad request.', type: 'error' }
        };
    }
};

const userAPI = {
    login: async (data: UserDetails) => {
        return await request('login', data, 'POST');
    },
    register: async (data: UserDetails) => {
        return await request('register', data, 'POST');
    },
    logout: async () => {
        return await request('logout');
    },
    checkStatus: async () => {
        return await request('user-status');
    },
    sendResetEmail: async (email: string) => {
        return await request('reset-pass', { email: email }, 'POST');
    },
    updatePassword: async (newPassword: string, confirm: string, token: string) => {
        return await request('reset-pass', { password: newPassword, password2: confirm }, 'PUT', {
            token: token
        });
    },
    updatePasswordWithCurrent: async (current, newPassword, confirmNewPassword) => {
        return await request(
            'update-pass',
            { currentPassword: current, password: newPassword, password2: confirmNewPassword },
            'PUT'
        );
    },
    verifyUser: async (token) => {
        return await request('verify', null, 'PUT', token);
    },
    // resendVerification: async (usernameOrEmail) => {
    //     console.log(usernameOrEmail);
    //     return await request('resend-verification', null, 'GET', usernameOrEmail);
    // },
    getProfile: async (id) => {
        return await request('myprofile');
    }
};

export default userAPI;

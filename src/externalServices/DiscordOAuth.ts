import axios, { AxiosRequestConfig } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

import sendSms from "../utils/sendSms";

interface TokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
};

interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    locale: string;
    mfa_enabled: string;
    email: string;
    verified: boolean;
}

export default class DiscordOAuth implements TokenResponse, DiscordUser {

	public access_token: string;
	public expires_in: number;
	public refresh_token: string;
	public scope: string;
	public token_type: string;
    public id: string;
    public username: string;
    public avatar: string;
    public discriminator: string;
    public locale: string;
    public mfa_enabled: string;
    public email: string;
    public verified: boolean;

    get profile() {
        return {
            id: this.id,
            username: this.username,
            avatar: this.avatar,
            discriminator: this.discriminator,
            locale: this.locale,
            mfa_enabled: this.mfa_enabled,
            email: this.email,
            verified: this.verified
        };
    }

    /**
     * convert JSON to x-www-form-urlencoded
     */
    private _formURLEncode(s: Record<string, string>) {
        const ret: string[] = [];
        for (const f in s) {
            ret.push(`${f}=${s[f]}`);
        }
        return ret.join('&');
    };

	private async _request<T = any>(
		target: string,
		method?: 'POST' | 'GET',
		options?: Omit<AxiosRequestConfig, 'method' | 'url'>
	): Promise<T> {

        let ret = {};
        
		try {
			const { data } = await axios({
				url: 'https://discord.com/api/v8' + target,
				method: method || 'GET',
                withCredentials: true,
                ...options
			});

            ret = data;
		}
        catch (e) {

            console.log(e.response);
            if (e.response && e.response === 401) {


            }

            else {

                throw new Error('unknown error communicating with Discord');
            }
        }

        return ret as T;
	}

	public async authenticate(code: string, host: string) {

        const ui = /localhost/.test(host)
            ? 'http://localhost:5000'
            : 'https://new.intellidnd.com';
            
        const creds = this._formURLEncode({
            'client_id': process.env.INTELLIDND_DISCORD_CLIENT_ID!,
            'client_secret': process.env.INTELLIDND_DISCORD_CLIENT_SECRET!,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': ui + (process.env.DISCORD_REDIRECT || '/oauth/discord')
        })

        let res: TokenResponse;
        try {
		res = await this._request<TokenResponse>('/oauth2/token', 'POST', {
            data: creds,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    } catch (e) {
        sendSms({
          message: `error: ${e}`,
          params: {},
          to: process.env.DEV_PHONE
        })
    }

        for (const k in res) {

            this[k] = res[k];
        }

        return this;
	}

    public async getProfile() {

        const res = await this._request<DiscordUser>('/users/@me', 'GET', {
            headers: {
                Authorization: `Bearer ${this.access_token}`
            }
        });

        for (const k in res) {

            this[k] = res[k];
        }
        
        return this;
    }
}

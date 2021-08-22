import '@utils/alias';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import requestIp from 'request-ip';
import Redis from 'redis';

import { initModels, initSequelize } from '@models';
import { interactionsDevWrapper, interactionsProdWrapper } from './routers/discordInteractions';
import core from 'routers/core';
import Twilio from 'twilio';
dotenv.config();

const PROD = process.env.NODE_ENV !== 'development';
const PORT = process.env.PORT;

const sequelize = initSequelize(process.env);
const db = initModels(sequelize);
const redisClient = Redis.createClient({
	url: process.env.REDIS_URL,
});

const app = express();

app.disable('x-powered-by')
	.set('trust proxy', true)
	.use(cors({
		origin: /localhost|intellidnd.com/,
		credentials: true,
		methods: ['GET', 'PATCH', 'POST', 'DELETE'],
		exposedHeaders: ['Limit', 'Remaining', 'Reset'].map(s => `X-RateLimit-${s}`)
	}))
	.use(interactionsProdWrapper({ db: db, sql: sequelize }))
	.use(cookieParser())
	.use(express.urlencoded({ extended: true }))
	.use(express.json())
	.use(requestIp.mw())
	.use(morgan('dev'))
	.use(interactionsDevWrapper({ db: db, sql: sequelize }))
	.use(core({
		twilio: Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN),
		prefix: process.env.VERSION_PREFIX || '/v1',
		env: process.env,
		db: db,
		redis: redisClient,
		sql: sequelize
	}))
	.all('*', (req, res) => {
		res.status(404)
			.json({
				message: `${req.method} ${req.path} not found`,
				code: 'server-01'
			})
			.end();
	})
	.listen(PORT, () => {
		console.log(
			`Online at ${
				PROD
					? 'https://api.intellidnd.com'
					: `http://localhost:${PORT}`
			}`
		);
	});

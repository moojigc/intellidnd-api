import './utils/alias';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import requestIp from 'request-ip';
import Redis from 'redis';

import { initModels, initSequelize } from './models';
import services from './routers/initServices';
import { interactionsDevWrapper, interactionsProdWrapper } from './routers/discordInteractions';
dotenv.config();

const PROD = process.env.NODE_ENV !== 'development';
const PORT = process.env.PORT;

const sequelize = initSequelize(process.env);
const models = initModels(sequelize);
const redisClient = Redis.createClient({
	// url: process.env.REDIS_URL,
	host: process.env.REDIS_HOST,
	port: parseInt(process.env.REDIS_PORT!),
	password: process.env.REDIST_PASS
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
	.use(interactionsProdWrapper({ db: models, sql: sequelize }))
	.use(cookieParser())
	.use(express.urlencoded({ extended: true }))
	.use(express.json())
	.use(requestIp.mw())
	.use(morgan('dev'))
	.use(interactionsDevWrapper({ db: models, sql: sequelize }))
	.use(services({
		db: models,
		sql: sequelize,
		redis: redisClient,
		env: process.env
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

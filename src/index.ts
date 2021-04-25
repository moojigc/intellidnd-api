import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as dotenv from 'dotenv';
import services from './utils/services';
import requestIp from 'request-ip';
import { initModels, initSequelize } from './models';
import Redis from 'redis';
dotenv.config();

const PROD = process.env.NODE_ENV !== 'development';
const PORT = process.env.PORT;

const sequelize = initSequelize(process.env);
const models = initModels(sequelize);

const app = express();

	app.disable('x-powered-by')
	.set('trust proxy', true)
	.use(cors({
		origin: '*',
		credentials: true,
		methods: ['GET', 'PATCH', 'POST', 'DELETE']
	}))
	.use(express.urlencoded({ extended: true }))
	.use(express.json())
	.use(requestIp.mw())
	.use(morgan('dev'))
	.use(services({
		db: models,
		sql: sequelize,
		redis: Redis.createClient(
			{
				url: process.env.REDIS_URL
			}
		)
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

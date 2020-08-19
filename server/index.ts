import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import morgan from 'morgan';
import connectMongo from 'connect-mongodb-session';
import passport from './middleware/passport';
import compression from 'compression';
import router from './routes';
import cors from 'cors';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { networkInterfaces } from 'os';

dotenv.config();
const MongoDBStore = connectMongo(session),
	PORT = process.env.PORT,
	MONGODB_URI =
		process.env.MONGODB_URI || 'mongodb://localhost/dnd-inventory',
	PROD = process.env.NODE_ENV === 'production';

mongoose
	.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	})
	.then((conn) => {
		console.log(`Connected to ${conn.connections[0].db.databaseName}`);
	})
	.catch(console.error);

const Store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'user-sessions',
});
Store.on('error', (error) => console.log(error));

const app = express();
PROD && app.use(express.static(resolve(__dirname, '..', 'client', 'build')));
!PROD && app.use(cors({ origin: 'http://localhost:3200' }));
app.use(express.urlencoded({ extended: true }))
	.use(express.json())
	// Session middleware
	.use(
		session({
			secret: process.env.SESS_SECRET || 'deku',
			resave: true,
			saveUninitialized: false,
			store: Store,
			cookie: {
				domain: PROD
					? 'https://intellidnd.com'
					: 'http://localhost:3200',
				sameSite: true,
				secure: 'auto',
			},
		})
	)
	.use(passport.initialize())
	.use(passport.session())
	.use(morgan('dev'))
	.use('/api/v1', router)
	.use(compression());

PROD &&
	app.get('*', (_, res) => {
		res.sendFile(resolve(__dirname, '..', 'client', 'build', 'index.html'));
	});
app.listen(PORT, () => {
	console.log(
		`Online at ${PROD ? 'https://intellidnd.com' : `http://${networkInterfaces().wifi0[0].address}:${PORT}`}`
	);
});

import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import morgan from 'morgan';
import connectMongo from 'connect-mongodb-session';
import passport from './middleware/passport';
import compression from 'compression';
import { characterRouter, userRouter } from './routes';
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
PROD && app.use(express.static(resolve('client', 'build')));
!PROD && app.use(cors({ origin: 'localhost:*', credentials: true }));
app.use(express.urlencoded({ extended: true }))
	.use(express.json())
	// Session middleware
	.use(
		session({
			secret: process.env.SESS_SECRET,
			resave: true,
			saveUninitialized: true,
			store: Store,
			cookie: {
				maxAge: 60000 * 60 * 24,
				// domain: PROD ? 'intellidnd.com' : 'localhost',
				sameSite: true,
				httpOnly: true,
				secure: 'auto',
			},
		})
	)
	.use(passport.initialize())
	.use(passport.session())
	.use(morgan('dev'))
	.use(compression());

userRouter(app);
characterRouter(app);

app.all('/api/v1/*', (req, res) => {
	res.status(404).json({
		flash: { message: `Sorry, ${req.path} doesn't exist!`, type: 'error' },
	}).end();
});

PROD &&
	app.get('*', (_, res) => {
		res.sendFile(resolve('client', 'build', 'index.html'));
	});
app.listen(PORT, () => {
	console.log(
		`Online at ${
			PROD
				? 'https://intellidnd.com'
				: `http://${networkInterfaces().wifi0[0].address}:${PORT}`
		}`
	);
});

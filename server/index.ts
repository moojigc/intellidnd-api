import express from 'express';
import session from 'express-session';
import mongoose from 'mongoose';
import connectMongo from 'connect-mongodb-session';
import passport from './config/passport';
import compression from 'compression';
import userRouter from './routes/user.router';
import cors from 'cors';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();
const MongoDBStore = connectMongo(session),
	PORT = process.env.PORT,
	MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/dnd-inventory',
	PROD = process.env.NODE_ENV === 'production';

mongoose
	.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
	.then((conn) => {
		console.log(`Connected to ${conn.connections[0].db.databaseName}`);
	})
	.catch(console.error);

const Store = new MongoDBStore({
	uri: MONGODB_URI,
	collection: 'user-sessions'
});
Store.on('error', (error) => console.log(error));

const app = express();
PROD && app.use(express.static(join('client', 'build')));
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
				domain: PROD ? 'https://intellidnd.com' : 'http://localhost:3200',
				sameSite: true,
				secure: 'auto'
			}
		})
	)
	.use(passport.initialize())
	.use(passport.session())
	.use(compression());

userRouter(app);

PROD &&
	app.get('*', (_req, res) => {
		res.sendFile(join(__dirname + 'client' + 'build' + 'index.html'));
	});
app.listen(PORT, () => {
	console.log(`Listening on ${PROD ? 'https://intellidnd.com' : `http://localhost:${PORT}`}`);
});

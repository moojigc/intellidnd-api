import type { Request, Response } from 'express';
import type { EmbedProperties } from './utils.ts/Embed';
import type { InteractionPayload, InteractionsServiceData } from './types';

import * as dotenv from 'dotenv';
dotenv.config();

import { Router } from 'express';
import { verifyKeyMiddleware, InteractionType, InteractionResponseType } from 'discord-interactions';

import { execute } from './commands';

const PREFIX = process.env.PREFIX || 'v1';
const interactionsRouterDevelopment = Router();
const interactionsRouterProduction = Router();
const interactionService = async (
	{ db, sql }: Omit<InteractionsServiceData, 'payload'>,
	req: Request,
	res: Response
) => {

	const payload = req.body as InteractionPayload;

	if (process.env.NODE_ENV === 'development') {

		console.log(JSON.stringify(payload, null, 2));
	}

	const commandName = payload.data.name;

	let response: {
		type: number;
		data?: {
			content?: string;
			embeds?: EmbedProperties[];
		};
	};

	try {
		switch (payload.type) {
			case InteractionType.COMMAND:
				response = await execute(commandName, { db, sql, payload });
				break;
			case InteractionType.PING:
				response = {
					type: InteractionResponseType.PONG,
				};
				break;
			default:
				throw {
					code: 'interactions-02',
					status: 400,
					message: 'invalid interaction type',
				};
		}

		res.status(200).json(response).end();
	}
	catch (e) {

		const err = {
			status: 500 || e.status,
			message: e.message || 'unhandled exception',
			code: e.code || 'interactions-01',
		};

		console.log(err);

		if (err.status >= 500) {

			console.log(e.stack);
		}

		res.status(err.status)
			.json({
				message: err.message,
				code: err.code,
			})
			.end();
	}
};
const route = `/${PREFIX}/interactions`;

export function interactionsDevWrapper(data: Omit<InteractionsServiceData, 'payload'>) {

	if (process.env.NODE_ENV === 'development') {

		interactionsRouterDevelopment.post(route, (req, res) =>
			interactionService(data, req, res)
		);
	}
	return interactionsRouterDevelopment;
};
	
export function interactionsProdWrapper(data: Omit<InteractionsServiceData, 'payload'>) {

	if (process.env.NODE_ENV !== 'development') {

		interactionsRouterProduction.post(
			route,
			verifyKeyMiddleware(process.env.INTELLIDND_PUBLIC_KEY!),
			(req, res) => interactionService(data, req, res)
		);
	}
	return interactionsRouterProduction;
}
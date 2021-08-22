import { CharacterCreationAttributes } from '../../models/Character';
import { ServiceData } from '@types';
import Service from '@lib/Service';

export default async function createCharacter(this: Service, { db, user, payload, err }: ServiceData) {

	const existingName = await db.Character.count({
		where: {
			userId: user.id,
			name: payload.name,
		},
	});

	if (existingName) {
		throw err(
			'character_create-01',
			400,
			'Character named ' + payload.name + ' already belongs to this user'
		);
	}

	const char = await db.Character.create({
		// @ts-ignore
		userId: user.id,
		...payload,
	});

	const inv = await db.Inventory.create({
		characterId: char.id,
	});

	const wallet = await db.Wallet.create({
		inventoryId: inv.id,
	});

	return {
		id: char.id,
		...payload,
		inventory: {
			items: [],
		},
		wallet: wallet.coins,
	};
}

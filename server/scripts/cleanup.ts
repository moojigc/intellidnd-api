import { User, Player } from '../models';
import { connect, Types } from 'mongoose';

const [username] = process.argv.slice(2);
const compare = (a, b) => Types.ObjectId(a).equals(b);

async function clean() {
	const user = await User.findOne({ username: username });
	console.log(user);
	const players = (user.players as string[]).map((p) =>
		Player.findOne({ _id: p })
	);
	const resolved = await Promise.all(players);
	const existing = resolved.filter((r) => r !== null);
	const notExisting = user.players.filter(
		(p) => existing.filter((e) => compare(e._id, p)).length === 0
	);
	const removal = await User.findOneAndUpdate(
		{ username: username },
		{
			$pullAll: {
				players: notExisting,
			},
		}
	);
	console.log(removal);
}
connect('mongodb://localhost/dnd-inventory').then((conn) => {
	clean().then((r) => {
		conn.connection.close();
	});
});

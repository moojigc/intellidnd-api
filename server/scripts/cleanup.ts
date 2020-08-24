import { User, Player, IGuild, Guild } from '../models';
import { connect, Types } from 'mongoose';

const [type, username] = process.argv.slice(2) as ['user' | 'guild', string];
const compare = (a, b) => Types.ObjectId(a).equals(b);

async function clean() {
	console.log(type === 'user');
	const user =
		type === 'user'
			? await User.findOne({ username: username })
			: await Guild.findOne({ _id: username });
	console.log(user);
	const players = (user?.players as string[]).map((p) =>
		Player.findOne({ _id: p })
	);
	const resolved = await Promise.all(players);
	console.log('-----resolved-----');
	console.log(resolved);
	const existing = resolved.filter((r) => r !== null);
	console.log('-----existing-----');
	console.log(existing);
	const notExisting = user?.players.filter(
		(p) => existing.filter((e) => compare(e._id, p)).length === 0
	);
	const removal =
		type === 'user'
			? await User.findOneAndUpdate(
					{ username: username },
					{
						$pullAll: {
							players: notExisting,
						},
					},
					{ new: true }
			  )
			: await Guild.findOneAndUpdate(
					{
						_id: username,
					},
					{
						$pullAll: {
							players: notExisting,
						},
					},
					{ new: true }
			  );
	console.log(removal);
}
connect('mongodb://localhost/dnd-inventory', {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useFindAndModify: true,
	useCreateIndex: true,
}).then((conn) => {
	clean()
		.then((r) => {
			conn.connection.close();
		})
		.catch((e) => {
			console.error(e);
			conn.connection.close();
		});
});

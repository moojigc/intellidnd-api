import { Message } from 'discord.js';
import { IPlayer } from '../../../server/src/models/Player';

const changelog = async (message: Message, player: IPlayer, moment: any) => {
    let readableLog = player.changelog.map(({ command, on }) => {
        return `Ran \`${command}\` at ${moment(on).format('hh:mm a, MMMM Do, YYYY')}.`;
    });
    message.author.send(readableLog.join('\n\n'));
};
export default changelog;

import type DevController from './dev.controller';

export default function callback(this: DevController, data: typeof DevController.ServiceData, context) {

    console.log(this.sayLol());

    context.res.header('X-Bruh-Lol', 'hi');
	return {
		time: new Date().toLocaleString(),
        data: data.payload
	};
}

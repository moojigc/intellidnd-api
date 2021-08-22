import Controller from '@lib/Controller';

export default class DevController extends Controller {
    public base = '/dev';
    public isPublic = true;
    public sharedParams: {
        param1: {
            type: 'string',
            name: 'bruhId'
        }
    }
    // @Controller.MakeService({
    //     route: '/ping',
    //     payload: {
    //         required: {
    //             bruh: 'string'
    //         },
    //         optional: null
    //     }
    // })

    public sayLol() {
        return 'lol';
    }
    public allPing = new Controller.Service({
        callback: __dirname + '/ping'
    });
}
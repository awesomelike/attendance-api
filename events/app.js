import EventEmitter from 'events';

class AppEmitter extends EventEmitter {}
const appEmitter = new AppEmitter();

export default appEmitter;

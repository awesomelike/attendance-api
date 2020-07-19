import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 10800 });

export default cache;

import NodeCache from 'node-cache';

const nodeCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

export default nodeCache;

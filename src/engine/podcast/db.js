import Dexie from 'dexie';

const db = new Dexie('podcasts');
db.version(1).stores({
    podcasts: `++id,title,description,domain,image,protocol,url,items,len,updated`
});
window.db = db;

export default db;

import Dexie from 'dexie';

export const cf = {
    name: 'podcasts'
}
const db = new Dexie(cf.name);

db.version(2).stores({
    podcasts: `title,description,domain,image,protocol,url,items,len,updated`
});

window.db = db;



export const findPodcast = (column,value) => db.podcasts.where(column).equals(value);

export const getTable = () => db.podcasts;

export default db;

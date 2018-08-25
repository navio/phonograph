import { set,get,keys,del } from 'idb-keyval';

const toArray = () => new Promise(acc=>{
  keys().then(keys => acc(Promise.all(keys.map( (key) => get(key) ))));
});


export default { set,get,keys,del,toArray };

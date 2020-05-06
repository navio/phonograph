import { set,get,keys,del, Store } from 'idb-keyval';

const toArray = () => new Promise(acc=>{
  keys().then(keys => acc(Promise.all(keys.map( (key) => get(key) ))));
});

export default (name = "podcasts", db = "podcastsuite" ) => ({ 
    name,
    db,
    set: function (key, value){
          const store = new Store(this.db,this.name);
          return set(key,value,store);
        },
    get: function (key){
      const store = new Store(this.db,this.name);
      return get(key,store) || null;
    },
    del: function (key){
      const store = new Store(this.db,this.name);
      return del(key,store);
    }, 
    keys: async function(){
      const store = new Store(this.db,this.name);
      return await keys(store);
    },
    entries: async function(){
      const store = new Store(this.db,this.name);
      const keys = await this.keys(store);
      return keys.map( (key) => get(key) );
    }
  });
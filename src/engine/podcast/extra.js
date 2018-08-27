// export const cachedContent = (url) =>{
//   let r = convertURLToPodcast(url);
//   return DEBUG ? url : `${CACHED[r.protocol]}${r.domain}`;
// }

// export const cacheImage= (url) =>{
//   let r = convertURLToPodcast(url);
//   return DEBUG ? url : `${PROXY[r.protocol]}${r.domain}`;
// }

// export const getPodcasts = function(podcasts){
//   return new Promise((acc,rej) => {
//     Promise.all(podcasts.map(cast =>{
//       let podcast = convertURLToPodcast(cast);
//       let CORS_PROXY = PROXY[podcast.protocol];
//       let found = sessionStorage.getItem(podcast.domain);
//       if(found){
//         return Promise.resolve(JSON.parse(found));
//       }else{
//         return new Promise((resolve,reject)=>{
//           load(CORS_PROXY + podcast.domain)
//           .then(RSS =>{
//               delete RSS['items'];
//               RSS.domain = podcast.domain;
//               resolve(RSS)
//           });
//         })
//       }
//     }))
//     .then(RSS => {
//       let clean = RSS.filter(rss=>rss['error']?false:true); 
//       clean.forEach((rss)=>{console.log('Saving',rss.domain);
//         sessionStorage.setItem(rss.domain,JSON.stringify(rss))
//       })
//       acc(clean);
//     })
//   })
// }
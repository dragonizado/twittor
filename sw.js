importScripts('js/sw-utils.js');


const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/spiderman.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/wolverine.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/hulk.jpg',
    'js/app.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];


self.addEventListener('install',e=>{
    const cache_static = caches.open(STATIC_CACHE)
    .then(cache => {
        cache.addAll(APP_SHELL)
    })

    const cache_inmutable = caches.open(INMUTABLE_CACHE)
    .then(cache=>{
        cache.addAll(APP_SHELL_INMUTABLE)
    })

    e.waitUntil(Promise.all([cache_static, cache_inmutable]));
});


self.addEventListener('activate',e=>{

    const cachesvi = caches.keys().then(keys=>{

        keys.forEach(key=>{
            if (key !== STATIC_CACHE && key.includes('static')){
               return caches.detele(key)
            }
        })
    })

    e.waitUntil(cachesvi);
})



self.addEventListener('fetch',e=>{
    
    const respuesta = caches.match(e.request).then(resp=>{
        if(resp){
            return resp
        }else{
            return fetch(e.request)
                .then(newRes =>{
                    return actualizarCacheDinamico(DYNAMIC_CACHE, e.request, newRes)
                })
        }

    })
    
    e.respondWith(respuesta)
})
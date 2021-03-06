importScripts('https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js');

importScripts('js/sw-db.js');
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
    'js/app.js',
    'js/sw-utils.js',
    'js/libs/plugins/mdtoast.min.css',
    'js/libs/plugins/mdtoast.min.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'https://cdn.jsdelivr.net/npm/pouchdb@7.1.1/dist/pouchdb.min.js',
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

            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }

        })
    })

    e.waitUntil(cachesvi);
})




self.addEventListener( 'fetch', e => {

    let respuesta;

    if(e.request.url.includes('/api')){
       
        respuesta = manejoApiMensajes(DYNAMIC_CACHE, e.request)
        
    }else{
        respuesta = caches.match(e.request).then(res => {

            if (res) {

                actualizaCacheStatico(STATIC_CACHE, e.request, APP_SHELL_INMUTABLE);
                return res;
            } else {

                return fetch(e.request).then(newRes => {

                    return actualizaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);

                });

            }

        });
    }
    
    e.respondWith(respuesta);
});


self.addEventListener('sync',e => {

    if( e.tag == 'nuevo-post'){
        //postear a DB cuando hay conexion
        const respuesta = postearMensajes()
        e.waitUntil(respuesta)
    }

})

self.addEventListener('push',e=>{
    
    const data = JSON.parse(e.data.text());


    const title = data.titulo;
    const options = {
        body:data.cuerpo,
        icon: `https://dragonizado.github.io/twittor/img/avatars/${data.usuario}.jpg`,
        badge: 'https://dragonizado.github.io/twittor/img/favicon.ico',
        image: 'https://datainfox.com/wp-content/uploads/2017/10/avengers-tower.jpg',
        vibrate: [125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600, 200, 600],
        openUrl:'https://dragonizado.github.io/twittor/',
        data:{
            url:'https://dragonizado.github.io/twittor/'
        },

    }

    e.waitUntil(self.registration.showNotification(title,options))
})


self.addEventListener('notificationclose',e=>{
    console.log('notificacion cerrada')
})


self.addEventListener('notificationclick', e => {
    
    const notificacion = e.notification

    const respuesta = clients.matchAll()
    .then(clientes => {

        let cliente = clientes.find(c =>{
            return c.visibilityState === 'visible'
        })

        if (cliente !== undefined){
            cliente.navigate(notificacion.data.url)
            cliente.focus()
        }else{
            clients.openWindow(notificacion.data.url)
        }
        return notificacion.close()

    })



    e.waitUntil(respuesta)
})

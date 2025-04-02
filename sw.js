importScripts("js/sw-utils.js")

const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const INMUTABLE_CACHE = 'inmutable-cache-v1';

const APP_SHELL = [ // Lo basico de la app y lo guardamos en static-cache.
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js',
    'manifest.json',
    "https://fonts.googleapis.com/css2?family=Quicksand:wght@400;700&display=swap",
    "https://fonts.gstatic.com/s/quicksand/v36/6xKtdSZaM9iE8KbpRA_hK1QNYuDyPw.woff2",
    "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXiWtFCc.woff2",
    "https://use.fontawesome.com/releases/v5.3.1/webfonts/fa-solid-900.woff2",
    "https://use.fontawesome.com/releases/v5.3.1/webfonts/fa-solid-900.ttf"
]

const APP_SHELL_INMUTABLE = [ // Lo que no cambia nunca. Generalmente creado por terceros.
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js',
];

self.addEventListener("install", (event) => {
    const cacheStatic = caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL));
    const cacheInmutable = caches.open(INMUTABLE_CACHE).then((cache) => cache.addAll(APP_SHELL_INMUTABLE));

    event.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
    console.log("SW instalado");
});

self.addEventListener("activate", (event) => {

    const respuesta = caches.keys().then((keys) => {
        keys.forEach((key) => {

            // Si la key no es igual a la cache estaticas, y contiene la palabra static, entonces se elimina.
            // key es el nombre de la cache.
            if (key !== STATIC_CACHE && key.includes("static")) {
                return caches.delete(key);
            }
        });
    });

    event.waitUntil(respuesta);


})


self.addEventListener("fetch", (event) => {
    // Si la petición es de una extensión, se salta el manejo personalizado
    if (event.request.url.startsWith("chrome-extension:")) {
        return event.respondWith(fetch(event.request));
    }

    // Verificamos todas las peticiones que se hacen a la app.
    const respuesta = caches.match(event.request).then((res) => {
        // Si existe en cache, entonces lo devolvemos.
        if (res) {
            console.log("Sirviendo desde Cache", event.request.url);
            return res;
        } else {
            // Si no existe en cache, entonces lo buscamos en la red.
            // Puede pasar por ejemplo en casos de font de google.
            // console.log("No existe en cache", event.request.url);
            return fetch(event.request, {
                mode: 'no-cors'
            }).then((newRes) => {
                // console.log("Nuevo", newRes);

                // Si la respuesta es una fuente (woff2, woff), no la cacheamos
                if (event.request.url.includes(".woff2") || event.request.url.includes(".woff")) {
                    console.warn("Fuente detectada, no se almacena en caché:", event.request.url);
                    return newRes; // Retorna la respuesta directamente sin cachear
                }
                console.log("Sirviendo desde la red", event.request.url);
                return actualizaCacheDinamico(DYNAMIC_CACHE, event.request, newRes);
            });
        }
    });

    event.respondWith(respuesta)
})
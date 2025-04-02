//* Funcion para guardar en cache dinamico
function actualizaCacheDinamico(dynamicCache, req, res) {
    console.log("Actualizando cache dinamico", dynamicCache, req.url);


    // Si la respuesta es ok, entonces guardamos en cache. Es decir tiene data
    if (res.ok) {
        // Abrimos la cache dinamica y guardamos la respuesta clonada.
        return caches.open(dynamicCache).then(cache => {

            cache.put(req, res.clone());

            return res.clone();

        });

    } else {
        // Si no existe en cache, entonces lo devolvemos.
        return res;
    }


}

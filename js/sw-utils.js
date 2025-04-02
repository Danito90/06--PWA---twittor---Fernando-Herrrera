//* Funcion para guardar en cache dinamico
function actualizaCacheDinamico( dynamicCache, req, res ) {
    return (dynamicCache, req, res) => {
        // Si la respuesta es ok, entonces guardamos en cache. Es decir tiene data
        console.log("Cache dinamico", res.ok);
        if (res.ok) {
            // Abrimos la cache dinamica y guardamos la respuesta clonada.
            return caches.open(dynamicCache).then((cache) => {
                cache.put(req, res.clone());
                return res.clone();
            });
        } else {
            // Si no existe en cache, entonces lo devolvemos.
            return res;
        }
    };
}
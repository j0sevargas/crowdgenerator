function generateCircularVertices(radius, numVertices) {
    var vertices = [];
    for (var i = 0; i < numVertices; i++) {
        var angle = 2 * Math.PI * i / numVertices;
        var x = radius * Math.cos(angle);
        var y = radius * Math.sin(angle);
        vertices.push([x, y]);
    }
    return vertices;
}


function generateSquareRootVertices( population , density = 1) {
    var vertices = [];

    const sqrt = Math.floor(Math.sqrt(population * density));
    const lowerlimit = sqrt / 2;

    for (var n = (-1 * lowerlimit); n < lowerlimit; n++) {

        for (var i = (-1 * lowerlimit); i < lowerlimit; i++) {



            vertices.push([i, n]);

        }

    }
    return vertices;
}


export { generateCircularVertices, generateSquareRootVertices };
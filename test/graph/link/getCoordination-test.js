var tape = require("tape"),
    jsdom = require("jsdom"),
    g3 = require("../../../dist/js/g3");

tape("get Link's path coordination correctly", function(test){
    var document = jsdom.jsdom('<svg id="graph"></svg>');
    var svg = document.querySelector("#graph");

    //horizontal
    var myGraph = g3.graph(svg)
        .nodes([{id: 1, x: 0, y: 0}, {id: 2, x: 100, y: 0}])
        .links([{id: 1, src: 1, dst: 2, direction: 0}, {id: 2, src: 1, dst: 2, direction: 1}, {id: 3, src: 1, dst: 2, direction: 2}, {id: 4, src: 1, dst: 2, direction: 3}]);


    test.deepEqual(myGraph.links()[0].getCoordination(), {Sx: 0, Sy: 0, Tx: 100, Ty: 0});
    test.deepEqual(myGraph.links()[1].getCoordination(), {Sx: 0, Sy: 0, Tx: 76, Ty: 0});
    test.deepEqual(myGraph.links()[2].getCoordination(), {Sx: 24, Sy: 0, Tx: 100, Ty: 0});
    test.deepEqual(myGraph.links()[3].getCoordination(), {Sx: 24, Sy: 0, Tx: 76, Ty: 0});


    //vertical
    myGraph.nodes([{id: 3, x: 100, y: 0, radius: 30}, {id: 4, x: 100, y: 100, radius: 50}])
        .links([{id: 5, src: 3, dst: 4, direction: 0, width: 10}, {id: 6, src: 3, dst: 4, direction: 1, width: 10}, {id: 7, src: 3, dst: 4, direction: 2, width: 10}, {id: 8, src: 3, dst: 4, direction: 3, width: 10}]);


    test.deepEqual(myGraph.links()[4].getCoordination(), {Sx: 100, Sy: 0, Tx: 100, Ty: 100});
    test.deepEqual(myGraph.links()[5].getCoordination(), {Sx: 100, Sy: 0, Tx: 100, Ty: 20});
    test.deepEqual(myGraph.links()[6].getCoordination(), {Sx: 100, Sy: 60, Tx: 100, Ty: 100});
    test.deepEqual(myGraph.links()[7].getCoordination(), {Sx: 100, Sy: 60, Tx: 100, Ty: 20});


    test.end();
});
var tape = require("tape"),
    jsdom = require("jsdom"),
    g3 = require("../../dist/js/g3");


tape("derive new Link from received Links", function(test){
    var document = jsdom.jsdom('<svg id="graph"></svg>');
    var svg = document.querySelector("#graph");

    var myGraph = g3.graph(svg)
        .nodes([{id: 1}, {id: 2}])
        .links([{id: 1, src: 1, dst: 2, label: "L1", color: "#ff0000", width: 5, direction: 1}, {id: 2, src: 2, dst: 1, label: "L2", color: "#00ff00", direction: 2}]);

    var linkObj = g3.utils.deriveLinkFromLinks(myGraph.links());
    test.equal(linkObj.id, "derived:1&2");
    test.equal(linkObj.label, "L1&L2");
    test.equal(linkObj.src, myGraph.links()[0].src);
    test.equal(linkObj.dst, myGraph.links()[0].dst);
    test.equal(linkObj.width, 4);
    test.equal(linkObj.color, "#ffff00");
    test.equal(linkObj.direction, 3);
    
    test.end();
});

tape("direction 0 + direction N = N", function(test){
    var document = jsdom.jsdom('<svg id="graph"></svg>');
    var svg = document.querySelector("#graph");

    var myGraph = g3.graph(svg)
        .nodes([{id: 1}, {id: 2}])
        .links([{id: 1, src: 1, dst: 2, direction: 0}, {id: 2, src: 2, dst: 1, direction: 2}]);

    var linkObj = g3.utils.deriveLinkFromLinks(myGraph.links());
    test.equal(linkObj.direction, 2);

    test.end();
});

tape("direction 1 + direction 2 = 3", function(test){
    var document = jsdom.jsdom('<svg id="graph"></svg>');
    var svg = document.querySelector("#graph");

    var myGraph = g3.graph(svg)
        .nodes([{id: 1}, {id: 2}])
        .links([{id: 1, src: 1, dst: 2, direction: 1}, {id: 2, src: 2, dst: 1, direction: 2}]);

    var linkObj = g3.utils.deriveLinkFromLinks(myGraph.links());
    test.equal(linkObj.direction, 3);

    test.end();
});

tape("direction 3 + direction N = 3", function(test){
    var document = jsdom.jsdom('<svg id="graph"></svg>');
    var svg = document.querySelector("#graph");

    var myGraph = g3.graph(svg)
        .nodes([{id: 1}, {id: 2}])
        .links([{id: 1, src: 1, dst: 2, direction: 3}, {id: 2, src: 2, dst: 1, direction: 0}]);

    var linkObj = g3.utils.deriveLinkFromLinks(myGraph.links());
    test.equal(linkObj.direction, 3);

    test.end();
});

tape("direction N + direction N = N", function(test){
    var document = jsdom.jsdom('<svg id="graph"></svg>');
    var svg = document.querySelector("#graph");

    var myGraph = g3.graph(svg)
        .nodes([{id: 1}, {id: 2}])
        .links([{id: 1, src: 1, dst: 2, direction: 2}, {id: 2, src: 2, dst: 1, direction: 2}]);

    var linkObj = g3.utils.deriveLinkFromLinks(myGraph.links());
    test.equal(linkObj.direction, 2);

    test.end();
});
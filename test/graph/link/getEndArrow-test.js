var tape = require("tape"),
    jsdom = require("jsdom"),
    g3 = require("../../../dist/js/g3");

tape("add Link's end arrow by direction", function(test){
    var document = jsdom.jsdom('<svg id="graph"></svg>');
    var svg = document.querySelector("#graph");

    var myGraph = g3.graph(svg)
        .nodes([{id: 1, x: 0, y: 0}, {id: 2, x: 100, y: 0}])
        .links([{id: 1, src: 1, dst: 2, direction: 0, label: "a"}, {id: 2, src: 1, dst: 2, direction: 1, label: "a"}, {id: 3, src: 1, dst: 2, direction: 2, label: "a"}, {id: 4, src: 1, dst: 2, direction: 3, label: "a"}]);


    test.equal(myGraph.links()[0].getEndArrow(), "");
    test.equal(myGraph.links()[1].getEndArrow(), "url(about:blank#end-arrow)");
    test.equal(myGraph.links()[2].getEndArrow(), "");
    test.equal(myGraph.links()[3].getEndArrow(), "url(about:blank#end-arrow)");


    test.end();
});
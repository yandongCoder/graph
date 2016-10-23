var tape = require("tape"),
    g3 = require("../../../dist/js/g3");

tape("select a Node", function(test){
    var myGraph = g3.graph(null, {ifRender: false})
        .nodes([{id: 1, x: 0, y: 0, selected: true}, {id: 2, x: 100, y: 0}]);

    myGraph.nodes()[0].selected(false);
    test.equal(myGraph.nodes()[0].selected(), false);
    myGraph.nodes()[1].selected(true);
    test.equal(myGraph.nodes()[1].selected(), true);

    test.end();
});

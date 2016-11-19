var tape = require("tape"),
    g3 = require("../../../dist/js/g3");

tape("Ungroup a grouped Node", function(test){
    var myGraph = g3.graph(null, {ifRender: false})
        .nodes([{id: 1}, {id: 2}, {id: 3}])
        .links([{id:1, src: 1, dst: 2}, {id:2, src: 2, dst: 3}]);

    myGraph.group([myGraph.nodes()[0], myGraph.nodes()[1]]);

    myGraph.nodes()[3].ungroup();
    
    test.deepEqual(myGraph.links()[1].source, myGraph.nodes()[1]);
    test.equal(myGraph.getRenderedNodes().length, 3);
    test.equal(myGraph.getRenderedLinks().length, 2);

    test.end();
});

tape("Can't ungroup a grouped Node was referenced by another grouped Node", function(test){
    var myGraph = g3.graph(null, {ifRender: false})
        .nodes([{id: 1}, {id: 2}, {id: 3}])
        .links([{id:1, src: 1, dst: 2}, {id:2, src: 2, dst: 3}]);

    myGraph.group([myGraph.nodes()[0], myGraph.nodes()[1]]);
    myGraph.group([myGraph.nodes()[3], myGraph.nodes()[2]]);

    myGraph.nodes()[3].ungroup();

    test.equal(myGraph.getRenderedNodes().length, 1);
    test.equal(myGraph.getRenderedLinks().length, 0);

    test.end();
});

// tape("Group Nodes, and merge attachedLinks, and ungroup this groupedNode.", function(test){
//     var myGraph = g3.graph(null, {ifRender: false})
//         .nodes([{id: 1}, {id: 2}, {id: 3}])
//         .links([{id:1, src: 1, dst: 2}, {id:2, src: 1, dst: 3}]);
//
//     myGraph.group([myGraph.nodes()[1], myGraph.nodes()[2]]);
//     myGraph.links()[0].merge();
//     myGraph.nodes()[3].ungroup();
//
//     test.equal(myGraph.links()[0].source.id, myGraph.nodes()[0].id);
//     test.equal(myGraph.links()[0].target.id, myGraph.nodes()[1].id);
//     test.equal(myGraph.links()[1].source.id, myGraph.nodes()[0].id);
//     test.equal(myGraph.links()[1].target.id, myGraph.nodes()[2].id);
//
//     test.equal(myGraph.getRenderedNodes().length, 3);
//     test.equal(myGraph.getRenderedLinks().length, 2);
//
//     test.end();
// });
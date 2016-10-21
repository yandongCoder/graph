var tape = require("tape"),
    g3 = require("../../dist/js/g3");

tape("add nodes to graph", function(test){
    var myGraph = g3.graph(null, {ifRender: false});

    //last could not add
    myGraph.nodes([{id: 1, label: "A", x: 50, y: 50}, {id: 2, label: "A", x: 100, y: 100},{id: 2, label: "A", x: 130, y: 130}]);
    test.equal(myGraph.nodes().length, 2);


    //could not add
    myGraph.nodes({id: 2, label: "X", x: 100, y: 120});
    test.equal(myGraph.nodes().length, 2);

    //could add
    myGraph.nodes({id: 3, label: "X", x: 100, y: 120});
    test.equal(myGraph.nodes().length, 3);


    //could add
    myGraph.nodes({label: "X", x: 100, y: 120});
    test.equal(myGraph.nodes().length, 4);
    //could not add
    myGraph.nodes({label: "X", x: 100, y: 120});
    test.equal(myGraph.nodes().length, 4);
    
    test.end();
});

tape("push new nodes and cover graph's current nodes", function(test){
    var myGraph = g3.graph(null, {ifRender: false});

    //add
    myGraph.nodes([{id: 1, label: "A", x: 50, y: 50}, {id: 2, label: "A", x: 100, y: 100},{id: 3, label: "A", x: 130, y: 130}]);
    test.equal(myGraph.nodes().length, 3);


    //cover
    myGraph.nodes({id: 4, label: "X", x: 100, y: 120}, true);
    test.equal(myGraph.nodes().length, 1);


    test.end();
});

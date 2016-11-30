//g3
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.g3 = global.g3 || {})));
}(this, (function (exports) { 'use strict';

const DIRECTION = {
    NONE: 0,
    S2D: 1,
    D2S: 2,
    DOUBLE: 3
};

const LINK_REMOVE_TYPE = {
    UNMERGE: 1,
    L2N: 2
};
const REMOVE_TYPE = {
    UNGROUP: 1
};

const RENDER_TYPE = {
    SELECT: "SELECT",
    NUDGE: "NUDGE",
    IMMEDIATELY: "IMMEDIATELY"
};

function select (selector) {
    return typeof selector === "string"? document.querySelector(selector): selector;
}

function delayRender(Obj, renderType){
    this.updateDOM.addObj(Obj, renderType);
    this.render(renderType);
    return this;
}

function renderImmediately(){
    this.render(RENDER_TYPE.IMMEDIATELY);
    return this;
}

function render(renderType) {
    var self = this;
    
    this._canvas = select(this._selector);
    
    if(!this._canvas) return this;
    if(!this._config.ifRender) return this;
    var canvasType = this._canvas.nodeName;
    if(canvasType === 'svg'){ this._init();}
    
    if(renderType === RENDER_TYPE.IMMEDIATELY){
        draw(renderType);
    }
    else{
        clearTimeout(this._renderDelay);
        this._renderDelay = setTimeout(function timeoutDraw(){draw(renderType)}, 0);
    }
    
    return this;
    
    function draw(renderType){
        console.log('draw');
        self._draw(renderType, canvasType);
    }
}

function toArray (maybeArr) {
    if(!Array.isArray(maybeArr)) maybeArr = [maybeArr];
    return maybeArr;
}

//中文为2长度，非中文为1

function getStrLen (str) {
    var len = 0;
    if (typeof str !== "string") {
        str = str.toString();
    }
    for (var i = 0; i < str.length; i++) {
        if (str.charAt(i) > '~') {
            len += 2;
        } else {
            len++;
        }
    }
    return len;
};

function attr(prop, val){
    if(val === undefined) return this["_" + prop];
    
    this["_" + prop] = val;
    this.graph.delayRender(this);
    
    return this;
}

function getX() {
    return this.x;
}

function getY() {
    return this.y;
}

function nudge (nudgeX, nudgeY) {
    if(!this.graph._config.dragable) return;
    
    this.x += nudgeX;
    this.y += nudgeY;
    
    return this;
}

function getConnectedLinks (grouped) {
    var connectedLinks = this.graph._links.filter(function (Link) {
        return (Link.source === this) || (Link.target === this);
    }, this);
    
    if(grouped){
        var separated = {};

        connectedLinks.forEach(function(Link){
            var separatedId = Link.getSourceId() === this.id? Link.getTargetId(): Link.getSourceId();
            if(separated[separatedId] === undefined) separated[separatedId] = [];
            separated[separatedId].push(Link);
        },this);

        connectedLinks = [];
        for (var k in separated){
            connectedLinks.push(separated[k]);
        }
    }

    return connectedLinks;
}

function remove (removeType) {
    delete this.graph._nodesHash[this.id];
    this.graph._nodes.splice(this.graph._nodes.indexOf(this), 1);
    
    if(this.groupedBy && (removeType !== REMOVE_TYPE.UNGROUP) ) this.groupedBy.remove();
}

//data: data obj, graph: graphInstance
function Node(data, graph) {
    this.graph = graph;
    this.id = data.id;
    this._label = data.label || "";
    this.x = data.x || 0;
    this.y = data.y || 0;
    this._disabled = data.disabled || false;
    this._radius = data.radius || graph._config.radius;
    this._color = data.color || graph._config.color;
    this._icon = data.icon  || graph._config.icon;
    this._mugshot = data.mugshot || graph._config.mugshot;
    this._selected = data.selected || false; //indicate whether node is select
    if(data.grouped) this._grouped = data.grouped;
    
    for (var prop in data) {
        if (data.hasOwnProperty(prop) && this[prop] === undefined) this[prop] = data[prop];
    }
}

Node.prototype = {
    constructor: Node,
    _nudge: nudge,
    attr: attr,
    getX: getX,
    getY: getY,
    getLabelWidth: function(){
        return getStrLen(this.attr("label")) * 9;
    },
    remove: remove,
    getConnectedLinks: getConnectedLinks
};

//Link has source and target Node in _nodes
function hasST () {
    return (this.source !== undefined) && (this.target !== undefined);
}

function getOffsetCoordinate (Sx, Sy, Tx, Ty, offsetS, offsetT) {
    var l = Math.sqrt((Tx - Sx) * (Tx - Sx) + (Ty - Sy) * (Ty - Sy));
    if(l === 0) l = 1;

    var sin = (Ty - Sy) / l;
    var cos = (Tx - Sx) / l;
    
    return {
        Sx: Sx + offsetS * cos,
        Sy: Sy + offsetS * sin,
        Tx: Tx - offsetT * cos,
        Ty: Ty - offsetT * sin
    }
}

var absUrl = window.location.href.split('#')[0];

function getStartArrow(status) {
    status = status? ("-" + status): "";
    if(this.attr("selected")) status = "-selected";
    
    if(this.attr("direction") === DIRECTION.D2S || this.attr("direction") === DIRECTION.DOUBLE)
        return "url(" + absUrl + "#start-arrow"+ status +")";
    else
        return "";
}

function getEndArrow (status) {
    status = status? ("-" + status): "";
    if(this.attr("selected")) status = "-selected";
    
    if(this.attr("direction") === DIRECTION.S2D || this.attr("direction") === DIRECTION.DOUBLE)
        return "url(" + absUrl + "#end-arrow"+ status +")";
    else
        return "";
}

function LineWidth(scale){
    var c = this.getCoordination(true);
    var x = c.Tx - c.Sx;
    var y = c.Ty - c.Sy;
    var z = Math.sqrt(x*x + y*y) * scale;
    
    return z;
}

function LineHeight(scale) {
    return this.attr("width") * scale;
}

function getLinkInfoTransform(scale) {
    var c = this.getCoordination(true);
    var rx = (c.Sx + c.Tx) / 2;
    var ry = (c.Sy + c.Ty) / 2;
    
    var x = c.Tx - c.Sx;
    var y = c.Ty - c.Sy;

    var radians =  Math.atan2(y, x) || 0;
    if (radians < 0) radians += 2 * Math.PI;
    var degrees = radians * 180 / Math.PI;
    if(degrees > 90 && degrees < 270) degrees -= 180;
    
    var transform  = 'rotate('+ degrees +' '+ rx +' '+ ry +') translate(' + rx + ' ' + ry + ') scale(' + 1 / scale + ')' + '';
    
    var offsetX =  - this.LineWidth(scale) / 2;
    var offsetY =  - this.LineHeight(scale) / 2;
    transform += ' translate('+ offsetX +' '+ offsetY +')';
    
    return transform;
}

//Link coordination is Node center's coordination or coordination where arrow placed, if any.
function getCoordination(forText) {
    
    var sourceOffset = this.source.attr("radius");
    var targetOffset = this.target.attr("radius");
    var arrowLength = this.attr("width") * 3;
    
    var Sx = this.source.getX(),
        Sy = this.source.getY(),
        Tx = this.target.getX(),
        Ty = this.target.getY();
    
    
    if(this.hasSourceArrow()) sourceOffset += arrowLength;
    if(this.hasTargetArrow()) targetOffset += arrowLength;
    
    var offset = getOffsetCoordinate(Sx, Sy, Tx, Ty, sourceOffset, targetOffset);
    
    if(this.hasSourceArrow()){
        Sx = offset.Sx;
        Sy = offset.Sy;
    }
    if(this.hasTargetArrow()){
        Tx = offset.Tx;
        Ty = offset.Ty;
    }
    
    if(forText){
        Sx = offset.Sx;
        Sy = offset.Sy;
        Tx = offset.Tx;
        Ty = offset.Ty;
    }
    
    return {
        Sx: Sx,
        Sy: Sy,
        Tx: Tx,
        Ty: Ty
    };
}

function attr$1(prop, val){
    if(val === undefined) return this["_" + prop];
    
    this["_" + prop] = val;
    this.graph.delayRender(this);
    
    return this;
}

function changeSource(source){
    if(source instanceof Node) this.source = source;
    
    this.graph.delayRender(this);
    
    return this;
}

function changeTarget(target){
    if(target instanceof Node) this.target = target;
    
    this.graph.delayRender(this);
    
    return this;
}

function getSourceId(){
    return this.source.id;
}

function getTargetId(){
    return this.target.id;
}

function remove$1 (type) {
    delete this.graph._linksHash[this.id];
    this.graph._links.splice(this.graph._links.indexOf(this), 1);

    this.graph.render();
    
    if(this.mergedBy && (type !== LINK_REMOVE_TYPE.UNMERGE) ) this.mergedBy.remove();
    if(this.transformedBy && (type !== LINK_REMOVE_TYPE.L2N)) this.transformedBy.remove();

    return this;
}

function getHomoLinks () {
    return this.graph._links.filter(function(Link){
        return (Link.source === this.source || Link.source === this.target) &&
                (Link.target === this.source || Link.target === this.target);
    }, this) || [];
}

function Link(data, graph) {
    this.graph = graph;
    this.id = data.id;
    this._label = data.label || "";
    this._width = data.width || (graph && graph._config.linkWidth);
    this._color = data.color || (graph && graph._config.linkColor);
    this._icon = data.icon  || graph._config.icon;
    this._mugshot = data.mugshot || graph._config.mugshot;
    this._selected = data.selected || false;
    this._direction = data.direction === undefined? 1: data.direction;//0: none, 1: from, 2: to, 3 double
    this._disabled = data.disabled || false;
    this._hide = data.hide || false;

    this.source = graph && this.graph._nodesHash[data.src];
    this.target = graph && this.graph._nodesHash[data.dst];
    
    
    var exceptKey = ['src', 'dst'];
    for (var prop in data) {
        if (data.hasOwnProperty(prop) && this[prop] === undefined && exceptKey.indexOf(prop) === -1) this[prop] = data[prop];
    }
}

Link.prototype = {
    constructor: Link,
    hasST: hasST,
    getCoordination: getCoordination,
    getStartArrow: getStartArrow,
    getEndArrow: getEndArrow,
    LineWidth: LineWidth,
    LineHeight: LineHeight,
    getLinkInfoTransform: getLinkInfoTransform,
    attr: attr$1,
    remove: remove$1,
    getSourceId: getSourceId,
    getTargetId: getTargetId,
    changeSource: changeSource,
    changeTarget: changeTarget,
    getHomoLinks: getHomoLinks,
    hasSourceArrow: function(){
        return this.attr("direction") === DIRECTION.D2S || this.attr("direction") === DIRECTION.DOUBLE;
    },
    hasTargetArrow: function(){
        return this.attr("direction") === DIRECTION.S2D || this.attr("direction") === DIRECTION.DOUBLE;
    }
};

function clearNodes() {
    this._nodes = [];
}

function clearLinks() {
    this._links = [];
}

function hasNode(obj) {
    return this._nodesHash[obj.id]? true: false;
}

function hasLink(obj) {
    return this._linksHash[obj.id]? true: false;
}

function addNode(obj) {
    var node = new Node(obj, this);
    if(!this.hasNode(node)){
        this._nodesHash[node.id] = node;
        this._nodes.push(node);
    }
    return node;
}

function addLink(obj) {
    var link = new Link(obj, this);
    if(!this.hasLink(link) && link.hasST()){
        this._linksHash[link.id] = link;
        this._links.push(link);
    }
    
    return link;
}

function removeNodes(filter) {
    this.getNodes(filter).forEach(function(Node){
        //remove links first
        this._removeLinksOfNode(Node);
        Node.remove();
    }, this);
    
    this.render();
}

function removeLinks(filter) {
    this.getLinks(filter).forEach(function(Link){
        Link.remove();
    }, this);
    
    this.render();
}

function removeLinksOfNode(Node) {
    Node.getConnectedLinks().map(function (Link) {
        Link.remove();
    }, this);
}

function nodes(nodes, cover) {
    nodes = toArray(nodes);
    
    if(!arguments.length) return this._nodes;
    if(cover) this.clearNodes();
    
    nodes.forEach(function(v){ this._addNode(v);},this);
    
    this.render();
    return this;
}

function links(links, cover) {
    links = toArray(links);
    
    if(!arguments.length) return this._links;
    if(cover) this.clearLinks();
    
    links.forEach(function(v){ this._addLink(v); },this);
    
    this.render();
    return this;
}

function getIds (array) {
    return array.map(function(item){
        if(typeof item  ===  'object') return item.id;
        else return item;
    });
}

//filter array of object which has id; filtered by id, or id array, or object that has id, or object array
//this function is convenient to Nodes or Links data.
function filterBy (filter, objArray) {
    if(typeof filter === "function"){
        var filtered = filter;
    }else if(filter === undefined || filter === null){
        filtered = function(){return true};
    }else{
        var ids = getIds(toArray(filter));

        filtered = function(v){
            return ids.indexOf(v.id) !== -1;
        };
    }
    
    var filteredArr = [];
    
    for(var i = 0; i < objArray.length; i++){
        if(filtered(objArray[i])) filteredArr.push(objArray[i]);
    }
    return filteredArr;
}

function getNodes(filter) {
    return filterBy(filter, this._nodes);
}

function getRenderedNodes() {
    return this.getNodes(function(Node){
        return !Node.attr("hide");
    });
}

function getSelectedNodes() {
    return this.getNodes(function(Node){
        return Node.attr("selected");
    });
}

function getLinks(filter) {
    return filterBy(filter, this._links);
}

function getSelectedLinks() {
    return this.getLinks(function(Link){
        return Link.attr("selected");
    });
}

function getDisabledLinks() {
    return this.getLinks(function(Link){
        return Link.attr("disabled");
    });
}

function getContainLinks(Nodes) {
    var ids = getIds(Nodes);
    var containedLinks = [];
    
    for(var i = this._links.length; i--;){
        var Link = this._links[i];
        if((ids.indexOf(Link.getSourceId()) !== -1) && (ids.indexOf(Link.getTargetId()) !== -1)){
            containedLinks.push(Link);
        }
    }
    return containedLinks;
}

function getAttachedLinks(Nodes) {
    var ids = getIds(Nodes);
    var links = this.getRenderedLinks();
    var attachedLinks = [];
    for(var i = links.length; i--;){
        var Link = links[i];
        if( (ids.indexOf(Link.getSourceId()) === -1 && ids.indexOf(Link.getTargetId()) !== -1) || (ids.indexOf(Link.getSourceId()) !== -1 && ids.indexOf(Link.getTargetId()) === -1) ){
            attachedLinks.push(Link);
        }
    }
    return attachedLinks;
}

function getRelatedLinks(Nodes) {
    return this.getContainLinks(Nodes).concat(this.getAttachedLinks(Nodes));
}

function getRenderedLinks() {
    return this.getLinks(function(Link){
        return !Link.attr("hide");
    });
}

function selectNodes(filter, retainOther) {
    if(!retainOther) this.deselectAll();
    this.getNodes(filter).forEach(function(Node){
        Node.attr("selected",true);
    }, this);
    return this;
}

function selectLinks(filter, retainOther) {
    if(!retainOther) this.deselectAll();
    this.getLinks(filter).forEach(function(Link){
        Link.attr("selected",true);
    }, this);
    return this;
}

function deselectAll(){
    this.deselectNodes();
    this.deselectLinks();
}

function deselectNodes() {
    this.getSelectedNodes().forEach(function(Node){
        Node.attr("selected",false);
    }, this);
    return this;
}

function deselectLinks(filter) {
    this.getSelectedLinks(filter).forEach(function(Link){
        Link.attr("selected", false);
    }, this);
    return this;
}

function disableNodes(filter, notRetainOther) {
    if(notRetainOther) this.enableAll();
    this.getNodes(filter).forEach(function(Node){
        Node.attr("disabled",true);
    }, this);
    return this;
}

function disableLinks(filter, notRetainOther) {
    if(notRetainOther) this.enableAll();
    this.getLinks(filter).forEach(function(Link){
        Link.attr("disabled", true);
    }, this);
    return this;
}

function enableAll(){
    this.enableNodes();
    this.enableLinks();
}

function enableNodes() {
    this.getDisabledNodes().forEach(function(Node){
        Node.attr("disabled",false);
    }, this);
    return this;
}

function enableLinks(filter) {
    this.getDisabledLinks(filter).forEach(function(Link){
        Link.attr("disabled", false);
    }, this);
    return this;
}

function appendPreDefs () {
    var str = '<defs>'+
                        '<filter id="shadow" x="-20%" y="-20%" width="200%" height="200%" type="Shadow" shadowoffsetx="5" shadowoffsety="5" shadowblur="5" shadowcolor="rgba(0,0,0)">' +
                            '<feOffset result="offOut" in="SourceGraphic" dx="0" dy="3"></feOffset>' +
                            '<feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"></feColorMatrix>' +
                            '<feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="2"></feGaussianBlur>' +
                            '<feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend>' +
                        '</filter>' +
                        '<marker id="start-arrow" viewBox="0 -5 10 10" refX="10" markerWidth="3" markerHeight="3" orient="auto"><path d="M10,-5L0,0L10,5"></path></marker>' +
                        '<marker id="start-arrow-hover" viewBox="0 -5 10 10" refX="10" markerWidth="3" markerHeight="3" orient="auto"><path d="M10,-5L0,0L10,5"></path></marker>' +
                        '<marker id="start-arrow-selected" viewBox="0 -5 10 10" refX="10" markerWidth="3" markerHeight="3" orient="auto"><path d="M10,-5L0,0L10,5"></path></marker>' +
                        '<marker id="end-arrow" viewBox="0 -5 10 10" refX="0" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,-5L10,0L0,5"></path></marker>' +
                        '<marker id="end-arrow-hover" viewBox="0 -5 10 10" refX="0" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,-5L10,0L0,5"></path></marker>' +
                        '<marker id="end-arrow-selected" viewBox="0 -5 10 10" refX="0" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,-5L10,0L0,5"></path></marker>' +
                        '<radialGradient id="linear" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">' +
                            '<stop offset="0%" style="stop-color:rgb(255，255,255);stop-opacity:0" />' +
                            '<stop offset="90%" style="stop-color:rgb(255,255,255);stop-opacity:1" />' +
                            '<stop offset="98%" style="stop-color:rgb(255,255,255);stop-opacity:1" />' +
                            '<stop offset="100%" style="stop-color:rgb(222，222, 222);stop-opacity:1" />' +
                        '</radialGradient>' +
                '</defs>';

    this._canvas.insertAdjacentHTML("afterbegin", str);
}

function appendPreElement () {
    var svg = this._getSvgSelection();
    this._brushSelection = svg.append("g").attr("class", "brush");

    var forceGroup = this._forceGroupSelection = svg.append('g').attr('class', 'force');
    
    forceGroup.append("g").attr("class", "links");
    forceGroup.append("g").attr("class", "nodes");
}

function Zoom() {
    var self = this;
    return d3.zoom().scaleExtent([this._config.minScale, this._config.maxScale])
        .on('start', function () {
            self._config.onZoomStart.call(this);
        })
        .on("zoom", this._zoomed.bind(this))
        .on('end', function () {
            self._config.onZoomEnd.call(this);
        });
}

function Brush () {
    var self = this;
    var brush = d3.brush()
        .extent([[0, 0], [3840, 2400]])
        .on('start', function () {
            if (!d3.event.selection) return; // Ignore empty selections.
            
            self._getNodesSelection().each(function (Node) {
                Node.pselected = d3.event.sourceEvent.ctrlKey && Node.attr("selected");
            });
            self._config.onBrushStart.call(this);
        })
        .on('brush', function () {
            if (!d3.event.selection) return; // Ignore empty selections.

            var extent = d3.event.selection;
            var t = self.getCurrentTransform();

            self._getNodesSelection().each(function(Node){
                Node.attr("selected",Node.pselected ^ ( (extent[0][0] - t.x) / t.k  <= Node.getX() && Node.getX() < (extent[1][0] - t.x) / t.k  && (extent[0][1] - t.y) / t.k <= Node.getY() && Node.getY() < (extent[1][1] - t.y) / t.k ));
            });
            self._config.onBrush.call(this);
        })
        .on('end', function () {
            if (!d3.event.selection) return; // Ignore empty selections.
            self._getBrushSelection()
                .call(brush.move, null);
            self._config.onBrushEnd.call(this);
        });

    brush.show = function(){
        self._getBrushSelection().style('display', 'block');
    };
    brush.hide = function(){
        self._getBrushSelection().style('display', 'none');
    };

    return brush;
}

function dragNode () {
    var self = this;
    var drag = d3.drag()
        .on("start", function (Node) {
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag", this.draged.bind(this))
        .on("end", function (Node) {

        });
    return drag;
}

function init () {
    //init trigger only once a graph
    if(this._hasInit) return;

    var self = this;

    //add predefined DOM
    appendPreElement.call(this);
    appendPreDefs.call(this);


    this._getSvgSelection()
        .classed("graph", true)
        .on('mousedown', function(){
            if (d3.event.target.nodeName !== 'svg') return;
            
            self.deselectAll();
    
            self._config.onGraphMousedown.call(this);
        })
        .on('contextmenu', function(){
            if (d3.event.target.nodeName !== 'svg') return;
            self._config.onGraphContextmenu.call(this);
        });

    //bind listener to page for keyboard shortCuts and mouse events
    d3.select(document.body)
        .on("keydown.brush", this._keydowned.bind(this))
        .on("keyup.brush", this._keyupped.bind(this));

    //add zoom instance to graph
    this.zoom = Zoom.call(this);
    this._getSvgSelection()
        .call(this.zoom);

    //add brush instance to graph
    this.brush = Brush.call(this);
    this._getBrushSelection()
        .call(this.brush);

    
    //new drag instance for bind to nodes
    this.dragNode = dragNode.call(this);

    this._hasInit = true;
}

function getAbsUrl (url) {
    return (url || window.location.href).split('#')[0];
}

function drawNodesSvg (renderType) {
 
    var self = this;
    var nodes = this._getNodesSelection().data(this.getRenderedNodes(), function (Node) { return Node.id;});

    var g = nodes.enter().append('g')
        .each(function(Node){ Node._element = this })//reference element to Node
        .classed('node', true)
        .on('mousedown', function(Node, i){
            if(!d3.event.ctrlKey){
                if(Node.attr("selected")) return;
                self.deselectNodes();
            }
            self.deselectLinks();
            Node.attr("selected",!Node.attr("selected"));
            
            self._config.onNodeMouseDown.call(this, Node, i);
        })
        .on('contextmenu', this._config.onNodeContextmenu)
        .on('mouseover', this._config.onNodeMouseover)
        .on('mouseout', this._config.onNodeMouseout)
        .call(this.dragNode);

    //添加矩形
    g.append("circle")
        .attr("filter", "url(" + getAbsUrl() + "#shadow)");
    g.append('svg:foreignObject')
        .attr('class', 'text-group')
        .append("xhtml:div")
        .append('xhtml:span');
    g.append('svg:foreignObject')
        .attr('class', 'icon')
        .append('xhtml:span');
    g.append('svg:foreignObject')
        .attr('class', 'mugshot')
        .append('xhtml:img');
    g.call(updateAttr);
    
    //need update Nodes Element
    if(renderType === RENDER_TYPE.IMMEDIATELY){
        var updateNodes = this._getNodesSelection();
    }else{
        updateNodes = d3.selectAll(this.updateDOM.getNodesEle());
    }
    updateNodes.call(updateAttr);
    
    this.updateDOM.clearUpdateNodes();
    
    nodes.exit().remove();
    
    function updateAttr(selection){
        var scale = self.getCurrentTransform().k;
        
        selection.attr("transform", function (Node) { return "translate(" + Node.getX() + "," + Node.getY() + ")";})
            .classed("selected", function(Node){return Node.attr("selected")})
            .classed("disabled", function(Node){return Node.attr("disabled")});
        
        selection.select('circle')
            .attr("r", function(Node){ return Node.attr("radius");})
            .style("fill", function(Node){ return Node.attr("color"); });
        
        selection.selectAll('.icon, .mugshot')
            .attr("transform", function(Node){ return "translate(" + -Node.attr("radius") + ", "+ -Node.attr("radius") +")"; })
            .attr("width", function(Node){return Node.attr("radius")*2;})
            .attr("height", function(Node){return Node.attr("radius")*2;});
        
        selection.select('.icon').select('span')
            .attr('class', function(Node){ return self._config.iconPrefix + Node.attr("icon");})
            .style("line-height", function(Node){return Node.attr("radius")*2 + "px";});
        selection.select('.mugshot').select('img')
            .attr('src', function(Node){return Node.attr("mugshot")? self._config.mugshotPrefix + Node.attr("mugshot"): "";})
            .style('display', function(Node){return Node.attr("mugshot")? "block": "none";});
        
        selection.select('.text-group')
            .style('display', function(Node){
                return (scale < self._config.scaleOfHideNodeLabel)? 'none': 'block';
            })
            .attr('width', function (Node) { return Node.getLabelWidth(); })
            .attr("height", function(Node){ return Node.attr("radius") * scale; })
            .style("line-height", function(Node){ return Node.attr("radius") * scale + "px"; })
            .attr("transform", function(Node){ return "translate(" + (1 + Node.attr("radius")) + ", 0) scale(" + 1 / scale + ")"; })
            
            .select('div')
            .attr('title', function (Node) { return Node.attr("label"); })
            .select('span')
            .text(function (Node) { return Node.attr("label"); });
    }
}

function drawLinksSvg (renderType) {
    var self = this;
    var scale = self.getCurrentTransform().k;
    
    var links = this._getLinksSelection().data(this.getRenderedLinks(), function (Link) { return Link.id });

    var link = links.enter()
        .append('g')
        .each(function(Link){ Link._element = this })
        .classed('link', true)
        .on('mousedown', function(Link, i){
            self.deselectAll();
            Link.attr("selected", !Link.attr("selected"));
        
            self._config.onLinkMouseDown.call(this, Link, i);
        })
        .on('contextmenu', this._config.onLinkContextmenu)
        .on('mouseover', this._config.onLinkMouseover)
        .on('mouseout', this._config.onLinkMouseout);
    
    link.append('path')
        .classed('link-path', true)
        .attr('id', function(Link){ return "link-path" + Link.id});
    
    
    var info = link
        .append('svg:foreignObject')
        .classed('link-info', true)
        .append("xhtml:div")
        .classed('center', true);
    
    info.append('xhtml:span').attr('class', 'icon');
    info.append('xhtml:span').attr('class', 'text');
    
    
    link.call(updateLinkAttr);
    
    
    if(renderType === RENDER_TYPE.IMMEDIATELY){
        var updateLinks  = this._getLinksSelection();
    }else if(renderType === RENDER_TYPE.NUDGE){
        updateLinks  = d3.selectAll(this.getRelatedLinks(this.getSelectedNodes()).map(function(Link){return Link._element;}));
    }else{
        updateLinks = d3.selectAll(this.updateDOM.getLinksEle());
    }
    
    
    updateLinks.call(updateLinkAttr);
    
    this.updateDOM.clearUpdateLinks();
    
    links.exit().remove();
    
    function updateLinkAttr(selection){
        // if(renderType === RENDER_TYPE.NUDGE){
        //     selection
        //         .select('path')
        //         .attr('d', function (Link) { var c = Link.getCoordination();  return 'M ' + c.Sx + ' ' + c.Sy + ' L ' + c.Tx + ' ' + c.Ty; });
        //     return;
        // }
        selection
            .select('path')
            .attr('d', function (Link) { var c = Link.getCoordination();  return 'M ' + c.Sx + ' ' + c.Sy + ' L ' + c.Tx + ' ' + c.Ty; })
            .classed("selected", function(Link){return Link.attr("selected")})
            .classed("disabled", function(Link){return Link.attr("disabled")})
            .style('marker-start', function (Link) { return Link.getStartArrow(); })
            .style('marker-end', function (Link) { return Link.getEndArrow(); })
            .style('stroke-width', function(Link){ return Link.attr("width"); })
            .style('stroke', function(Link){ return Link.attr("color"); });
    
        // if(renderType === RENDER_TYPE.NUDGE){
        //     selection
        //         .attr('dx', function(Link){return Link.getTextOffset(); })
        //         .attr('transform', function(Link){ return Link.getLinkLabelTransform(scale); });
        //     return;
        // }
        
        var info = selection
            .select('.link-info')
            .attr('transform', function(Link){
                return Link.getLinkInfoTransform(scale);
            })
            .style('display', function(Link){
                return (scale < self._config.scaleOfHideLinkLabel)? 'none': 'block';
            })
            .classed("disabled", function(Link){return Link.attr("disabled")})
            .attr('width', function (Link) {return Link.LineWidth(scale)})
            .attr('height', function(Link){return Link.LineHeight(scale)});
        
        info.select('.text')
            .text(function (Link) {return Link.attr("label");});
    
        info.select('.icon')
            .attr('class', function(Link){ return self._config.iconPrefix + Link.attr("icon");})
    }
}

function drawCanvas () {
    var context = this._canvas.getContext("2d");

    context.clearRect(0, 0, this._canvas.width, this._canvas.height);

    context.strokeStyle = "#ccc";
    context.beginPath();
    this.getRenderedLinks().forEach(function(Link) {
        context.moveTo(Link.source.getX(), Link.source.getY());
        context.lineTo(Link.target.getX(), Link.target.getY());
    });
    context.stroke();

    context.beginPath();
    this.getRenderedNodes().forEach(function(Node) {
        context.fillStyle = Node.attr("color");
        context.moveTo(Node.getX(), Node.getY());
        context.arc(Node.getX(), Node.getY(), Node.attr("radius"), 0, 2 * Math.PI);
    });
    context.fill();
}

function draw (renderType, canvasType) {
    if(canvasType === 'svg'){
        drawNodesSvg.call(this, renderType);
        drawLinksSvg.call(this, renderType);
    }else if(canvasType === 'CANVAS'){
        drawCanvas.call(this);
    }
}

function zoomed () {
    //不可移动
    if (!this.movable) {
        //将变换前的translate值赋给变换后的translate值,保持位置不变
        //this.zoom.translate(scope.config.status.translate);
    }
    //不可缩放
    if (!this.zoomable) {
        //this.zoom.scale(scope.config.status.scale);
    }
    //Graph._ifShowLabels();
    
    var previousScale = this._getForceGroup()._pScale;
    var currentScale = this.getCurrentTransform().k.toFixed(4) / 1;
    //缩放网络图
    this._getForceGroup().attr("transform", "translate(" + d3.event.transform.x + ", "+ d3.event.transform.y + ") scale(" + currentScale + ")");
    this._getForceGroup()._pScale = currentScale;
    
    var hideScale = d3.min([this._config.scaleOfHideNodeLabel, this._config.scaleOfHideLinkLabel]);
    
    //render while should hide label
    if(previousScale >= hideScale && currentScale <= hideScale) this.renderImmediately();
    //panning don't need re-render, render only after zooming
    if(currentScale !== previousScale && currentScale > hideScale) this.renderImmediately();
}

function transform(k, x, y, duration) {
    var transformed = d3.zoomIdentity;
    if(typeof k === "number") transformed = transformed.scale(k);
    if(typeof x === "number" && typeof y === "number") transformed = transformed.translate(x, y);
    this._getSvgSelection(duration).call(this.zoom.transform, transformed);
    
    return this;
}

function scaleTo(k, duration) {
    this.transform(k, null, null, duration);
    return this;
}

function translateBy(x, y, duration) {
    this.transform(null, x, y , duration);
    return this;
}

function keydowned() {
    if (!d3.event.metaKey) {
        switch (d3.event.keyCode) {
            //shift alt and space is used by d3 brush
            case 90:
                this.brush.show();
                break;
            case 46:
                this.removeNodes(this.getSelectedNodes());
            break;
            case 65:
                if(d3.event.ctrlKey) this.selectNodes(this.getNodes());
                d3.event.preventDefault();
            break;
        }
    }
}

function keyupped() {
    if (!d3.event.metaKey) {
        switch (d3.event.keyCode) {
            case 90:
                this.brush.hide();
                break;
        }
    }
}

function draged (currentNode) {
    var nudgedNodes = this.getSelectedNodes();
    for(var i = nudgedNodes.length; i--;){
        nudgedNodes[i]._nudge(d3.event.dx, d3.event.dy, true);
        this.updateDOM.addObj(nudgedNodes[i]);
    }
    this.delayRender(null, RENDER_TYPE.NUDGE);
}

const DEFAULT_CONFIG = {
    radius: 15,
    linkWidth: 3,
    movable: true,
    zoomable: true,
    dragable: true,
    ifRender: true,
    color: "#123456",
    linkColor: "#a1a1a1",
    minScale: 0.1,
    maxScale: 3.0,
    scaleOfHideNodeLabel: 0.8,
    scaleOfHideLinkLabel: 0.8,
    icon: "",
    iconPrefix: "",
    mugshot: "",
    mugshotPrefix: "",
    onBrushStart: function(){},
    onBrush: function(){},
    onBrushEnd: function(){},
    onZoomStart: function(){},
    onZoom: function(){},
    onZoomEnd: function(){},
    onGraphMousedown: function(){},
    onGraphContextmenu: function(){},
    onNodeMouseDown: function(){},
    onNodeContextmenu: function(){},
    onNodeMouseover: function(){},
    onNodeMouseout: function(){},
    onLinkMouseover: function(){},
    onLinkMouseout: function(){},
    onLinkMouseDown: function(){},
    onLinkContextmenu: function(){},
    radiusFunc: null
};


function config(config) {
    if(!arguments.length) return this._config;
    
    this._config = Object.assign({}, DEFAULT_CONFIG, this._config || {}, config || {});
    return this;
}

function selector(selector){
    if(!arguments.length) return this._selector;
    
    this._selector = selector;
    return this;
}

function UpdateDOM(graph){
    this.graph = graph;
    this._updateNodes = [];
    this._updateLinks = [];
};

UpdateDOM.prototype = {
    constructor: UpdateDOM,
    addObj: addObj,
    _addNode: addNode$1,
    _addLink: addLink$1,
    getNodesEle: getNodesEle,
    getLinksEle: getLinksEle,
    clearUpdateNodes: clearUpdateNodes,
    clearUpdateLinks: clearUpdateLinks
    
};

function addObj(Obj, renderType){
    if(Obj instanceof Node){
        this._addNode(Obj);
        if(renderType === RENDER_TYPE.NUDGE){
            var selectedNodes = this.graph.getSelectedNodes();
            var relatedLinks = this.graph.getRelatedLinks(selectedNodes);
            relatedLinks.forEach(function(Link){
                this._addLink(Link);
            }, this);
            
        }
    }
    if(Obj instanceof Link) this._addLink(Obj);
}

function addNode$1(Node){
    if(this._updateNodes.indexOf(Node) === -1) this._updateNodes.push(Node);
}

function addLink$1(Link){
    if(this._updateLinks.indexOf(Link) === -1) this._updateLinks.push(Link);
}

function getNodesEle(){
    return this._updateNodes.map(function(Node){return Node._element;});
}

function getLinksEle(){
    return this._updateLinks.map(function(Link){return Link._element;});
}

function clearUpdateNodes(){
    this._updateNodes = [];
}

function clearUpdateLinks(){
    this._updateLinks = [];
}

function Graph(selector, config) {
    
    this.selector(selector);
    this.config(config);
    
    this._hasInit = false; //init only once
    
    this._nodes = [];
    this._nodesHash = {};
    this._links = [];
    this._linksHash = {};
    
    this.updateDOM = new UpdateDOM(this);
}

Graph.prototype = {
    constructor: Graph,
    selector: selector,
    config: config,
    render: render,
    delayRender: delayRender,
    renderImmediately: renderImmediately,
    nodes: nodes,
    getNodes: getNodes,
    getSelectedNodes: getSelectedNodes,
    getRenderedNodes: getRenderedNodes,
    _addNode: addNode,
    removeNodes: removeNodes,
    clearNodes: clearNodes,
    selectNodes: selectNodes,
    selectLinks: selectLinks,
    deselectNodes: deselectNodes,
    deselectLinks: deselectLinks,
    deselectAll: deselectAll,
    disableNodes: disableNodes,
    disableLinks: disableLinks,
    enableAll: enableAll,
    enableNodes: enableNodes,
    enableLinks: enableLinks,
    hasNode: hasNode,
    links: links,
    getLinks: getLinks,
    getSelectedLinks: getSelectedLinks,
    getDisabledLinks: getDisabledLinks,
    getRenderedLinks: getRenderedLinks,
    getContainLinks: getContainLinks,
    getAttachedLinks: getAttachedLinks,
    getRelatedLinks: getRelatedLinks,
    _addLink: addLink,
    hasLink: hasLink,
    removeLinks: removeLinks,
    _removeLinksOfNode: removeLinksOfNode,
    clearLinks: clearLinks,
    transform: transform,
    scaleTo: scaleTo,
    translateBy: translateBy,
    draged: draged,
    _keydowned: keydowned,
    _keyupped: keyupped,
    _init: init,
    _draw: draw,
    _zoomed: zoomed,
    getCurrentTransform: function(){
        if(!this._canvas) return;
        return d3.zoomTransform(this._canvas);
    },
    _getBrushSelection: function () {
        return this._getSvgSelection().select('g.brush');
    },
    _getSvgSelection: function(duration){
        var svgSelection = d3.select(this._canvas);

        if(duration) svgSelection = svgSelection.transition(Math.random()).duration(duration);

        return svgSelection
    },
    _getSelectedNodesSelection: function(){
        return this._getSvgSelection().select('.nodes').selectAll("g.node.selected");
    },
    _getNodesSelection: function(){
        return this._getSvgSelection().select('.nodes').selectAll("g.node");
    },
    _getNodesLabelSelection: function(){
        return this._getNodesSelection().selectAll('.text-group');
    },
    _getLinksSelection: function(){
        return this._getSvgSelection().select('g.links').selectAll(".link");
    },
    _getForceGroup: function(){
        return this._forceGroupSelection;
    }
};

function index (selector, config) {
    return new Graph(selector, config);
}

function filterById (id, Nodes) {
    return Nodes.filter(function(Node){
        return Node.id === id;
    })[0];
}

function parseHTML (str) {
    var tmp = document.implementation.createHTMLDocument();
    tmp.body.innerHTML = str;
    return tmp.body.children[0];
}

function concat(key, objArray){
    return objArray.map(function(obj){
        return obj[key] instanceof Function ? obj[key]() : obj[key];
    }).join("&");
}

function average(key, objArray){
    return objArray.reduce(function(p, obj){
            return p + (obj[key] instanceof Function ? obj[key]() : obj[key]);
        }, 0) / objArray.length;
}

function direction(Links){
    var src = Links[0].getSourceId();
    var dst = Links[0].getTargetId();
    
    return Links.reduce(function(p, Link){
        if(p === DIRECTION.NONE) return Link.attr("direction");
        if(Link.attr("direction") === DIRECTION.NONE) return p;
        if(p === DIRECTION.DOUBLE || Link.attr("direction") === DIRECTION.DOUBLE) return DIRECTION.DOUBLE;
        
        if(Link.getSourceId() === src){
            if((p === DIRECTION.S2D && Link.attr("direction") === DIRECTION.D2S) || (p === DIRECTION.D2S && Link.attr("direction") === DIRECTION.S2D)) return DIRECTION.DOUBLE;
            else return p;
        }else{
            if((p === DIRECTION.S2D && Link.attr("direction") === DIRECTION.S2D) || (p === DIRECTION.D2S && Link.attr("direction") === DIRECTION.D2S)) return DIRECTION.DOUBLE;
            else return p;
        }
        
        if(p === Link.attr("direction")) return p;
    }, DIRECTION.NONE);
}

function deriveLinkFromLinks (Links, graph) {

    var obj = {};
    obj.id = "merged:" + concat("id", Links);
    obj.label = concat("label", Links);
    obj.width = average('_width', Links);
    obj.src = Links[0].getSourceId();
    obj.dst = Links[0].getTargetId();
    obj.color = graph._config.linkColor;
    obj.direction = direction(Links);

    
    return obj;
}

function deriveLinkFromLNL (srcLinks, Node, dstLinks, graph) {
    srcLinks = srcLinks.length > 1? new Link(deriveLinkFromLinks(srcLinks, graph), graph): srcLinks[0];
    dstLinks = dstLinks.length > 1? new Link(deriveLinkFromLinks(dstLinks, graph), graph): dstLinks[0];

    var obj = {};
    obj.id = "transformed:(" + srcLinks.id + ")" + Node.id + "(" + dstLinks.id + ")";
    obj.label = "(" + srcLinks.attr("label") + ")" + Node.attr("label") + "(" + dstLinks.attr("label") + ")";
    obj.src = srcLinks.getSourceId() === Node.id? srcLinks.getTargetId(): srcLinks.getSourceId();
    obj.dst = dstLinks.getSourceId() === Node.id? dstLinks.getTargetId(): dstLinks.getSourceId();
    obj.width = (srcLinks.attr("width") + dstLinks.attr("width")) / 2;
    obj.color = Node.attr("color");
    obj.direction = direction([srcLinks, dstLinks]);

    return obj;
}

function deriveNodeFromNodes (Nodes, graph) {
    var obj = {};
    obj.id = "grouped:" + concat("id", Nodes);
    obj.label = concat("label", Nodes);
    obj.radius = average('_radius', Nodes);
    obj.x = average('x', Nodes);
    obj.y = average('y', Nodes);
    obj.color = graph._config.color;
    obj.selected = Nodes.every(function(Node){ return Node.attr("selected")});

    return obj;
}

function safeExecute (maybeFunction) {
    return (maybeFunction instanceof Function)? maybeFunction(): maybeFunction;
}

var utils = {
    filterBy: filterBy,
    filterById: filterById,
    getIds: getIds,
    getAbsUrl: getAbsUrl,
    toArray: toArray,
    getStrLen: getStrLen,
    getOffsetCoordinate: getOffsetCoordinate,
    parseHTML: parseHTML,
    deriveLinkFromLinks: deriveLinkFromLinks,
    deriveLinkFromLNL: deriveLinkFromLNL,
    deriveNodeFromNodes: deriveNodeFromNodes,
    concat: concat,
    average: average,
    direction: direction,
    safeExecute: safeExecute
};

exports.graph = index;
exports.utils = utils;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=g3.js.map

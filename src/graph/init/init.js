import appendPreDefs from "./appendPreDefs";
import appendPreElement from "./appendPreElement";
import Zoom from "./Zoom";
import Brush from "./Brush";
import DragNode from "./DragNode";

export default function () {
    //init trigger only once a graph
    if(this._hasInit) return;


    //add predefined DOM
    appendPreElement.call(this);
    appendPreDefs.call(this);

    this._getSvgSelection()
        .classed("graph", true);

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
    this.dragNode = DragNode.call(this);

    this._hasInit = true;
}
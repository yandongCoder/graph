import Node from "./node/index";

export default function (obj) {
    var node = new Node(obj, this);
    if(!this.hasNode(node)) this._nodes.push(node);
}

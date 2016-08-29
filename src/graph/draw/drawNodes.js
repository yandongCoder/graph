export default function () {

    var nodes = d3.select('svg .nodes').selectAll("g.node").data(this._nodes, function (d) {
        return d.id;
    });

    var g = nodes.enter().append('g')
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .classed('node', true);
    
    //添加矩形
    g.append("rect").attr("width", this._r).attr("height", this._r).attr("filter", "url(" + window.location.href.split('#')[0] + "#shadow)");
}
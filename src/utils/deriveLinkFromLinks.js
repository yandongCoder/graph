import concat from "../utils/deriveConcat";
import average from "../utils/deriveAverage";
import direction from "../utils/deriveDirection";

export default function (Links, graph) {

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

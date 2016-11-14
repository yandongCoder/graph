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
    scaleOfHideLabel: 0.8,
    icon: "",
    iconPrefix: "",
    mugshot: "",
    mugshotPrefix: "",
    onGraphClick: function(){},
    onGraphContextmenu: function(){},
    onNodeMouseDown: function(){},
    onNodeContextmenu: function(){},
    onLinkMouseDown: function(){},
    onLinkContextmenu: function(){}
};

export default DEFAULT_CONFIG;
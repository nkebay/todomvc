define("sinpost/Signpost", 
    function(require){

        var Signpost = function(config){
            var self = this, liWidth = 100 / (config.lists.length);
            self.signPostUl = $('#' + config.signPostId);

            $("li", self.signPostUl).css({"width": liWidth + '%'});
        }

        Signpost.prototype = {

        };

        return Signpost;

    }
);

$(function(){
    var signPost = require("sinpost/Signpost");
    new signPost({
        signPostId: "signpost1",
        lists:[
            {text: "Describe"},
            {text: "Describe"},
            {text: "Select Shipping", active: true},
            {text: "Review"}
        ]
    });
});
'use strict';

define(
    'app/Router', 
    ['raptor/pubsub'], 
    function(pubsub, require, exports, module){

        return {
            init: function(){
                Router({
                    '/:filter': {
                        on: this.filter
                    },
                    '/': {
                        on: this.filter
                    }
                }).init();
            },

            filter: function(param){

                pubsub.publish('routes/filter', {view: param || 'all'});
                $('#filters a')
                    .removeClass('selected')
                    .filter( '[href="#/' + (param || '') + '"]' )
                    .addClass('selected');
            }
        };
    }
);
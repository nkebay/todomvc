'use strict';

define.Class(
    'task/Task', 
    ['raptor/pubsub', 'raptor/templating'], 
    function(pubsub, templating, require, exports, module){

        var ENTER_KEY = 13,
            taskList = $('#todo-list'),
            store = require('store/TodoStore').getInstance();


        function Task(config){
            var c = config, self = this;
            self.task = c.task;
            self.create(c);
            self.subscribe();
        };

        Task.prototype = {

            /* create new task - add new task list and attach events  - test */
            create: function(config){
                var self = this, c = config;
                self.model = c.model || store.create({title: self.task, completed: false});

                var output = templating.renderToString('task', {rowId: self.model.id, title: self.task, checked: self.model.completed});
                self.list = $(output).appendTo(taskList);
                self.editElem = $('input.edit', self.list);
                self.taskLabel = $('[data-title]', self.list);
                self.events();
            },

            /** attach events for toogle checkbox, edit task, destroy button, update the task */
            events: function(){
                var self = this, list = self.list;
                list.on('click', 'input.toggle', $.proxy(self.toggle, self));
                list.on('dblclick', '[data-title]', $.proxy(self.edit, self));
                list.on('keypress', 'input.edit', $.proxy(self.update, self));
                list.on('click', '[data-destroy]', $.proxy(self.destroy, self));

            },

            subscribe: function(){
                var self = this;
                pubsub.subscribe('app/clearcompleted', self.clearCompleted, self);
            },

            /** on click of checkbox, toggle completed/not done**/
            toggle: function(){
                var self = this;
                self.list.toggleClass('completed');
                self.model = store.update({id: self.model.id, title: self.task, completed: self.list.hasClass('completed')});
                pubsub.publish('task/toggled');
            },

            /** Edit the current task **/
            edit: function(){
                var self = this;
                self.list.addClass('editing');
                return self.editElem.focus();
            },

            /** update the task with new value **/
            update: function(ev){
                if (ev.which === ENTER_KEY){
                    var self = this, newTitle = self.editElem.val();
                    self.taskLabel.html(newTitle);
                    self.list.removeClass('editing');
                    self.model = store.update({id: self.model.id, title: newTitle, completed: self.list.hasClass('completed')});
                }
            },

            /** remove the task on click of close button */
            destroy: function(){
                var self = this, taskId = self.model.id;
                self.model = store.remove(self.model);
                self.list.remove();
                pubsub.publish('task/destroyed', {taskId: taskId});
            },

            clearCompleted: function(){
                if (this.hasCompleted()){
                    this.destroy();
                }
            },

            hasCompleted: function(){
                return this.model && this.model.completed;
            },

            display: function(visible){
                visible ? this.list.show() : this.list.hide();
            }

        };

        return Task;
    }
);

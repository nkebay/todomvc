'use strict';

define(
    'app/App', 
    ['raptor', 'raptor/pubsub'], 
    function(raptor, pubsub, require, exports, module){
        
        // Private properties
        var ENTER_KEY = 13,
            newTodo = $('#new-todo'),
            main = $('#main'),
            footer = $('#footer'),
            todoCount = $('#todoCount'),
            completedCount = $('#completedCount'),
            completedBtn = $('#clear-completed'),
            todoTask = require('task/Task'),
            store = require('store/TodoStore').getInstance(),
            tasks = {},
            forEachEntry = raptor.forEachEntry;

        return {

            //Initialize TODO APP
            init: function(){   
                var self = this;        
                self.events();
                self.subscribe();
                self.setTasksFromStore();
            },

            // Set DOM events for text field and clear button
            events: function(){
                var self = this;
                newTodo.on('keypress', $.proxy(self.onKeyPress, self));
                completedBtn.on('click', function(){
                    pubsub.publish('app/clearcompleted');
                });
            },

            // Subscribe to task updates.
            subscribe: function(){
                var self = this;
                pubsub.subscribe('task/toggled', self.refresh, self);
                pubsub.subscribe('task/destroyed', self.destroyTask, self);
                pubsub.subscribe('refresh', self.refresh, self);
                pubsub.subscribe('routes/filter', self.filter, self);
            },

            // Set the initial workspace with all the tasks from local store
            setTasksFromStore: function(){
                forEachEntry(store.findAll(), function(key, model){
                    tasks[model['id']] = new todoTask({task: model['title'], model: model});
                });
                
                pubsub.publish('refresh');    
            },

            // return of  count of todo and coompleted tasks
            tasksStatusCount: function(){
                var todo = 0, completed = 0;

                forEachEntry(tasks, function(id, task){
                    if (task.hasCompleted()) completed++;
                    else todo++;    
                });
                
                return {todo: todo, completed: completed};
            },

            // Capture ENTER Key on text field.
            onKeyPress: function(ev){
                if ( ev.which === ENTER_KEY ) {
                    this.addTask();
                }
            },

            // Create New task - each task is new instance of todoTask
            addTask: function(){
                var val = newTodo.val(), newTask = new todoTask({task: val});
                tasks[newTask.model.id] = newTask;
                newTodo.val("");

                pubsub.publish('refresh');
            },

            // Delete the task
            destroyTask: function(obj){
                delete tasks[obj.taskId];
                pubsub.publish('refresh');
            },

            // refresh app when task is toggled (completed/todo) or removed
            refresh: function(){
                var status = this.tasksStatusCount(), todo = status.todo,  completed = status.completed,
                    show = (todo + completed) > 0;

                if (show){
                    main.show();
                    footer.show();
                } else {
                    main.hide();
                    footer.hide();
                }

                todoCount.html(todo);
                completedCount.html(completed);

                if (completed > 0){
                    completedBtn.show();
                } else {
                    completedBtn.hide();
                }
            },

            /*
            * Filter the tasks for the selected view 
            * view = obj.view - "comompeted", "active" or "all"
            */
            filter: function(obj){
                var view = obj.view;
                raptor.forEachEntry(tasks, function(id, task){
                    var completed = task.hasCompleted();
                    switch(view){
                        case 'completed':
                            task.display(completed);
                            break;
                        case 'active':
                            task.display(!completed);
                            break;
                        case 'all':
                        case 'default':
                            task.display(true);
                            break;
                    }

                }, this);
            }
        
        };
    }
);

/** Start the app on load **/
$(function(){
    require('app/App').init();
    require('app/Router').init();
});
"use strict";define.Class("store/Store",function(){function e(e){var t=this;t.name=e;var n=localStorage.getItem(t.name);t.data=n&&JSON.parse(n)||{}}return e.prototype={save:function(){var e=this;localStorage.setItem(e.name,JSON.stringify(e.data))},create:function(e){var t=this;return e.id||(e.id=Date.now()),t.data[e.id]=e,t.save(),e},update:function(e){var t=this;return t.data[e.id]?(t.data[e.id]=e,t.save(),e):t.create(e)},findById:function(e){return this.data[e]},findAll:function(){return this.data},remove:function(e){var t=this;return delete t.data[e.id],t.save(),null}},e});
"use strict";define("store/TodoStore",function(e,t,n){var r="raptor-todo",i=e("store/Store"),s=null;return{getInstance:function(){return s==null&&(s=new i(r)),s}}});
$rset("rhtml","task",function(e){var t=e.e,n=e.ne,r=e.xa,i=e.x;return function(e,t){var n=e.rowId,s=e.title,o=e.checked;t.w('<li id="row_').w(r(n)).w('"').a("rowId",n).a("class",o?"completed":"").w('><div class="view"><input class="toggle" type="checkbox"').a("checked",o?"checked":"").w('><label data-title="title">').w(i(s)).w('</label><button class="destroy" data-destroy="close"></button></div><input class="edit"').a("value",s).w(' data-edit="edit"></li>')}});
"use strict";define.Class("task/Task",["raptor/pubsub","raptor/templating"],function(e,t,n,r,i){function a(e){var t=e,n=this;n.task=t.task,n.create(t),n.subscribe()}var s=13,o=$("#todo-list"),u=n("store/TodoStore").getInstance();return a.prototype={create:function(e){var n=this,r=e;n.model=r.model||u.create({title:n.task,completed:!1});var i=t.renderToString("task",{rowId:n.model.id,title:n.task,checked:n.model.completed});n.list=$(i).appendTo(o),n.editElem=$("input.edit",n.list),n.taskLabel=$("[data-title]",n.list),n.events()},events:function(){var e=this,t=e.list;t.on("click","input.toggle",$.proxy(e.toggle,e)),t.on("dblclick","[data-title]",$.proxy(e.edit,e)),t.on("keypress","input.edit",$.proxy(e.update,e)),t.on("click","[data-destroy]",$.proxy(e.destroy,e))},subscribe:function(){var t=this;e.subscribe("app/clearcompleted",t.clearCompleted,t)},toggle:function(){var t=this;t.list.toggleClass("completed"),t.model=u.update({id:t.model.id,title:t.task,completed:t.list.hasClass("completed")}),e.publish("task/toggled")},edit:function(){var e=this;return e.list.addClass("editing"),e.editElem.focus()},update:function(e){if(e.which===s){var t=this,n=t.editElem.val();t.taskLabel.html(n),t.list.removeClass("editing"),t.model=u.update({id:t.model.id,title:n,completed:t.list.hasClass("completed")})}},destroy:function(){var t=this,n=t.model.id;t.model=u.remove(t.model),t.list.remove(),e.publish("task/destroyed",{taskId:n})},clearCompleted:function(){this.hasCompleted()&&this.destroy()},hasCompleted:function(){return this.model&&this.model.completed},display:function(e){e?this.list.show():this.list.hide()}},a});
"use strict";define("app/App",["raptor","raptor/pubsub"],function(e,t,n,r,i){var s=13,o=$("#new-todo"),u=$("#main"),a=$("#footer"),f=$("#todoCount"),l=$("#completedCount"),c=$("#clear-completed"),h=n("task/Task"),p=n("store/TodoStore").getInstance(),d={},v=e.forEachEntry;return{init:function(){var e=this;e.events(),e.subscribe(),e.setTasksFromStore()},events:function(){var e=this;o.on("keypress",$.proxy(e.onKeyPress,e)),c.on("click",function(){t.publish("app/clearcompleted")})},subscribe:function(){var e=this;t.subscribe("task/toggled",e.refresh,e),t.subscribe("task/destroyed",e.destroyTask,e),t.subscribe("refresh",e.refresh,e),t.subscribe("routes/filter",e.filter,e)},setTasksFromStore:function(){v(p.findAll(),function(e,t){d[t.id]=new h({task:t.title,model:t})}),t.publish("refresh")},tasksStatusCount:function(){var e=0,t=0;return v(d,function(n,r){r.hasCompleted()?t++:e++}),{todo:e,completed:t}},onKeyPress:function(e){e.which===s&&this.addTask()},addTask:function(){var e=o.val(),n=new h({task:e});d[n.model.id]=n,o.val(""),t.publish("refresh")},destroyTask:function(e){delete d[e.taskId],t.publish("refresh")},refresh:function(){var e=this.tasksStatusCount(),t=e.todo,n=e.completed,r=t+n>0;r?(u.show(),a.show()):(u.hide(),a.hide()),f.html(t),l.html(n),n>0?c.show():c.hide()},filter:function(t){var n=t.view;e.forEachEntry(d,function(e,t){var r=t.hasCompleted();switch(n){case"completed":t.display(r);break;case"active":t.display(!r);break;case"all":case"default":t.display(!0)}},this)}}}),$(function(){require("app/App").init(),require("app/Router").init()});
"use strict";define("app/Router",["raptor/pubsub"],function(e,t,n,r){return{init:function(){Router({"/:filter":{on:this.filter},"/":{on:this.filter}}).init()},filter:function(t){e.publish("routes/filter",{view:t||"all"}),$("#filters a").removeClass("selected").filter('[href="#/'+(t||"")+'"]').addClass("selected")}}});
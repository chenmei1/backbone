// Generated by CoffeeScript 1.6.3
(function() {
  var Backbone, Todo, TodoList, Todos, app, pubnub, unicaster, _;

  _ = require('underscore')._;

  Backbone = require('backbone');

  unicaster = require('./unicaster');

  pubnub = require('pubnub').init({
    publish_key: 'pub-c-6dd9f234-e11e-4345-92c4-f723de52df70',
    subscribe_key: 'sub-c-4c7f1748-ced1-11e2-a5be-02ee2ddab7fe'
  });

  Todo = Backbone.Model.extend({
    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false
      };
    },
    toggle: function() {
      return this.save({
        done: !this.get('done')
      });
    }
  });

  TodoList = Backbone.Collection.extend({
    model: Todo,
    done: function() {
      return this.where({
        done: true
      });
    },
    remaining: function() {
      return this.without.apply(this, this.done());
    },
    remaining: function() {
      return this.without.apply(this, this.done());
    },
    nextOrder: function() {
      if (!this.length) {
        return 1;
      }
      return this.last().get('order') + 1;
    },
    comparator: 'order'
  });

  Todos = new TodoList;

  pubnub.subscribe({
    channel: 'backbone-collection-TodoList',
    callback: function(message) {
      var data, diff, record;
      console.log(message);
      data = JSON.parse(message);
      if (data.method === "create") {
        return Todos.add(data.model);
      } else if (data.method === "delete") {
        return Todos.remove(data.model);
      } else if (data.method === "update") {
        if (!!data.model.id) {
          record = _.find(Todos.models, function(record) {
            return record.id === data.model.id;
          });
          if (record == null) {
            console.log("Could not record: " + model.id);
          }
          diff = _.difference(_.keys(record.attributes), _.keys(data.model));
          _.each(diff, function(key) {
            return record.unset(key);
          });
          return record.set(data.model, data.options);
        }
      }
    }
  });

  app = unicaster.listen(pubnub);

  app.on('getTodos', function(req, resp) {
    return resp.end(Todos.toJSON());
  });

}).call(this);

/*
  @Inspired by original version by @apendua / apendua@gmail.com
  @git: https://github.com/apendua/meteor-tags

  @Current version - @patrickleet
  @git: https://github.com/patrickleet/meteor-tags
*/

Tags = {};

Meteor.tags = new Meteor.Collection("tags");

var _ = Package.underscore._;
var tagsInterface = {};
var collections = {};
var validators = {};
var defaultCollection = null;
var hasCollection2 = !!Package['aldeed:collection2'];

var safe = function (userId, collection, selector, action) {
  var count = 0;
  if (!_.isFunction(action))
    return;

  collection.find(selector).forEach(function (doc) {
    var allow = Meteor.isClient || _.some(validators[collection._name].allow, function (callback) {
      return callback.call(undefined, userId, doc);
    });
    var deny = !Meteor.isClient && _.some(validators[collection._name].deny, function (callback) {
      return callback.call(undefined, userId, doc);
    });
    if (!allow || deny)
      throw new Meteor.Error(403, 'Action not allowed');
    if (action.call(undefined, doc))
      count++;
  });
  return count;
};

_.extend(Tags, {

  TagsMixin: function (collection) {

    if (!collection._name)
      throw new Error('tags mixin may only be used with named collections');

    // for further reference
    collections[collection._name] = collection;
    validators[collection._name] = { allow: [], deny: [] };

    if (!defaultCollection)
      defaultCollection = collection;

    // prepare methods object
    var methods = {}, prefix = '/' + collection._name + '/';

    // server methods

    methods[prefix + 'addTag'] = function (selector, tagName, tagGroup) {
      if (!tagName)
        throw new Meteor.Error(400, 'tagName must be non-empty');

      var tagGroupKey = (!!tagGroup) ? tagGroup + "Tags" : 'tags';

      var userId = this.userId;

      //TODO: optimize this
      var nRefs = safe(userId, collection, selector, function (doc) {
        // first add tagName to tag's list of selected documents
        if (doc[tagGroupKey] && doc[tagGroupKey].indexOf(tagName) >= 0)
          // this tag is already there so don't update
          return false;

        // create an object to add tag to group 
        // and also add group to tagGroups
        var updateOptions = {};
        updateOptions.$addToSet = {};
        updateOptions.$addToSet[tagGroupKey] = tagName;
        if (!!tagGroup) {
          updateOptions.$addToSet.tagGroups = tagGroup;
        }

        // if collection2 and attached schema use validate:false
        if (hasCollection2 && !!collection.simpleSchema()) {
          collection.update({_id:doc._id}, updateOptions, {validate: false});
        } else {
          collection.update({_id:doc._id}, updateOptions);
        }
        
        return true;
      });//safe

      if (nRefs) {
        // if at least one tag was added, update tags collection
        var tag = Meteor.tags.findOne({
          name: tagName,
          collection: collection._name
        });

        if (tag) {
          Meteor.tags.update({_id:tag._id}, {
            $inc : { nRefs     : nRefs },
            $set : { changedAt : new Date() },
          });
          return tag._id;
        }

        return Meteor.tags.insert({
          collection : collection._name,
          createdBy  : userId,
          createdAt  : new Date(),
          nRefs      : nRefs,
          name       : tagName,
          group      : tagGroup
        });
      }// if (nRefs)
    };//addTag

    methods[prefix + 'removeTag'] = function (selector, tagName, tagGroup) {
      var tagGroupKey = (!!tagGroup) ? tagGroup + "Tags" : 'tags';
      var nRefs = safe(this.userId, collection, selector, function (doc) {
        if (!doc[tagGroupKey] || doc[tagGroupKey].indexOf(tagName) < 0)
          return false;

        var updateOptions = {};
        updateOptions.$pull = {};
        updateOptions.$pull[tagGroupKey] = tagName;
        // if there will be no tags in the group, remove the group from tagGroups
        if ( (doc[tagGroupKey].length - 1) === 0) {
          updateOptions.$pull.tagGroups = tagGroup;
        }

        // if collection2 use validate:false
        if (hasCollection2 && !!collection.simpleSchema()) {
          collection.update({_id:doc._id}, updateOptions, {validate: false});
        } else {
          collection.update({_id:doc._id}, updateOptions);
        }

        return true;
      });
      // 
      if (nRefs) {
        var newNumRefs = nRefs - 1;
        Meteor.tags.update({
          name: tagName, 
          collection: collection._name, 
          group: tagGroup
        }, {
          $inc : { nRefs     : newNumRefs },
          $set : { changedAt : new Date() },
        });
        

      } 
    };

    // client methods

    collection.addTag = function (tagName, tagGroup, selector) {
      // if tagGroup is an object, then it's probably a selector object
      if (typeof tagGroup === 'object') {
        selector = tagGroup;
        tagGroup = undefined; 
      }
      Meteor.call(prefix + 'addTag', selector, tagName, tagGroup, function (err) {
        if (err) throw new Meteor.Error(500, 'Unable to add tag ' + tagName, err);
      });
    };

    collection.removeTag = function (tagName, tagGroup, selector) {
      if (typeof tagGroup === 'object') {
        selector = tagGroup;
        tagGroup = undefined; 
      }
      Meteor.call(prefix + 'removeTag', selector, tagName, tagGroup, function (err) {
        if (err) throw new Meteor.Error(500, 'Unable to add tag ' + tagName, err);
      });
    };

    //TODO: use allow/deny pattern

    collection.allowTags = function (callback) {
      if (!_.isFunction(callback))
        throw new Error('allow callback must be a function');
      validators[collection._name].allow.push(callback);
    };

    collection.denyTags = function (callback) {
      if (!_.isFunction(callback))
        throw new Error('dany callback must be a function');
      validators[collection._name].deny.push(callback);
    };

    // define meteor methods

    Meteor.methods(methods);
  },

  _getCollection: function (name) {
    if (!name)
      return defaultCollection;
    return collections[name];
  },

});
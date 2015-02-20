# meteor-tags

The package defines helpers that allow you to add groups of tags to documents in your collections.

## Installation
```
meteor add patrickleet:tags
```

## Collection API

To add tags to selected collection use the `Tags.TagsMixin` routine:
```javascript
MyCollection = new Meteor.Collection("myCollection");
Tags.TagsMixin(MyCollection);
```
You can now do stuff like this:
```javascript
MyCollection.addTag('tagName', selector);
MyCollection.addTag('tagName', 'tagGroup', selector);
MyCollection.removeTag('tagName', selector);
MyCollection.removeTag('tagName', 'tagGroup', selector);
```

By default the above actions are not allowed. To change this behavior you will need to allow actions on tags:
```javascript
MyCollection.allowTags(function (userId) {
    // only allow if user is logged in
    return !!userId;
});
```

To search for all documents with a given tag use:
```javascript
MyCollection.find({tags:'tagName'});
```

To search for all documents with a given tag in a group use:
```javascript
MyCollection.find({tagGroupTags:'tagName'});
```

Tags are stored as an array on the documents specified by the selector. If you use a tagGroup the group is prefixed by the tagGroup name and also stored on the documents. That means getting the tags for a particular document is as simple as:
```javascript 
MyCollection.addTag('so tag', {_id: 1});
MyCollection.addTag('much meta', {_id: 1});
MyCollection.findOne({_id: 1}).tags; // ['so tag', 'much meta']

MyCollection.addTag('Chelsea', 'neighborhood', {_id: 1});
MyCollection.findOne({_id: 1}).neighborhoodTags; // ['Chelsea']

```

To see all tagGroups on a document
```javascript
MyCollection.findOne().tagGroups 
```
This may be useful to loop through and check all of the tag properties of the document
```javascript
var myDoc = MyCollection.findOne({_id: 1});
_.each(myDoc.tagGroups, function(groupName) {
   console.log(myDoc[groupName+'Tags']);
});
```

## Meteor.tags

Additionally, you have a read only access to `Meteor.tags` collection that keeps record about all tags existing in your database. The records are documents consisting of the following fields:
```javascript
{
    collection : // name of the corresponding collection
    createdAt  : // the date, this tag was first used
    createdBy  : // userId
    nRefs      : // number of references
    name       : // name of this tag
    group      : // name of tag group
}
```

## UI

The package is very lightweight, and does not include any UI, as many JQuery plugins work very well already. Here is an example of a UI using selectize: https://gist.github.com/patrickleet/e1c7a05eca86f536e3d4

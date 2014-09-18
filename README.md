# meteor-tags

The package defines helpers that allow you to
add groups of tags to documents in your collections.

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
By default the above actions are not allowed. To change this behavior
you will need to allow actions on tags:
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

To see all tagGroups on a document
```javascript
MyCollection.findOne().tagGroups
```

## Meteor.tags

Additionally, you have a read only access to `Meteor.tags` collection
that keeps record about all tags existing in your database. The records
are documents consisting of the following fields:
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
const MongoClient = require('mongodb').MongoClient;

function execute(action, callback) {
    connectToMongo(this, function (err, collection, db, condition) {
        if (err) {
            callback(err);
        } else {
            action(callback, collection, db, condition)
        }
   });
};

function connectToMongo(obj, callback) {
    MongoClient.connect(obj._url, function (err, db) {
        if (err) {
            callback(err);
        } else {
            var currentCollection = db.collection(obj.collectionName.toString());
            callback(null, currentCollection, db, obj.request);
        }
    });
};

addCondition = function (operator, value) {
    var conditionParameter = {};
    this.request[this.conditionWord] = conditionParameter;
    conditionParameter[operator] = value;
    if (this.denial) {
        this.denial = false;
    }
    return this;
},

module.exports = {
    server: function (uri) {
        this._url = uri;
        this.request = {};
        this.denial = false;
        this.setData = {};
        return this;
    },
    collection: function (collectionName) {
        this.collectionName = collectionName;
        return this;
    },
    not: function () {
        this.denial = true;
        return this;
    },
    where: function (conditionWord) {
        this.conditionWord = conditionWord;
        return this;
    },
    set: function functionName(field, key) {
        this.set[field] = key;
        return this;
    },
    equal: function (value) {
        var operator = this.denial ? '$gte' : '$eq';
        return addCondition.bind(this)(operator, value);
    },
    lessThan: function (value) {
        var operator = this.denial ? '$ne' : '$lt';
        return addCondition.bind(this)(operator, value);
    },
    greatThan: function (value) {
        var operator = this.denial ? '$lte' : '$ge';
        return addCondition.bind(this)(operator, value);
    },
    include: function (values) {
        var operator = this.denial ? '$nin' : '$in';
        return addCondition.bind(this)(operator, values);
    },
    remove: function(callback){
        execute.bind(this)(function(callback, collection, db, condition){
            collection.deleteMany(condition, function (err, docs) {
                callback(err, docs);
                db.close();
                this.request = {};
            });
        }, callback)
    },
    find: function(callback){
        execute.bind(this)(function(callback, collection, db, condition){
            collection.find(condition).toArray(function (err, docs) {
                callback(err, docs);
                db.close();
                this.request = {};
            });
        }, callback)
    },
    update: function(callback){
        execute.bind(this)(function(callback, collection, db, condition){
            var updateObj = {};
            updateObj.$set = this.set;
            updateObj.$currentDate = {lastModified: true};
            collection.update(condition, updateObj, function (err, docs) {
                callback(err, docs);
                db.close();
                this.request = {};
                this.setData = {};
            });
        }, callback)
    },
    insert: function(newRecord, callback){
        execute.bind(this)(function(callback, collection, db, condition){
            collection.insert(newRecord, function (err, docs) {
                callback(err, docs);
                db.close();
                this.request = {};
            });
        }, callback)
    }
};

const MongoClient = require('mongodb').MongoClient;

function execute(action, callback) {
    connectToMongo(this, function (err, response) {
        if (err) {
            callback(err);
        } else {
            action(callback, response)
        }
   });
};

function connectToMongo(obj, callback) {
    MongoClient.connect(obj._url, function (err, db) {
        if (err) {
            callback(err);
        } else {
            var response = {};
            var collection = db.collection(obj.collectionName.toString());
            response.collection = collection;
            response.db = db;
            response.condition = obj._request;
            callback(null, response);
        }
    });
};

var multivarka = {
    server: function (uri) {
        this._url = uri;
        this._request = {};
        this._denial = false;
        this._setData = {};
        return this;
    },
    collection: function (collectionName) {
        this.collectionName = collectionName;
        return this;
    },
    not: function () {
        this._denial = true;
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
        var operator = this._denial ? '$ne' : '$eq';
        return addCondition(operator, value);
    },
    lessThan: function (value) {
        var operator = this._denial ? '$gte' : '$lt';
        return addCondition(operator, value);
    },
    greatThan: function (value) {
        var operator = this._denial ? '$lte' : '$gt';
        return addCondition(operator, value);
    },
    include: function (values) {
        var operator = this._denial ? '$nin' : '$in';
        return addCondition(operator, values);
    },
    remove: function(callback){
        execute.bind(this)(function(callback, response){
            response.collection.deleteMany(response.condition, function (err, docs) {
                callback(err, docs);
                response.db.close();
                this._request = {};
            });
        }, callback)
    },
    find: function(callback){
        execute.bind(this)(function(callback, response){
            response.collection.find(response.condition).toArray(function (err, docs) {
                callback(err, docs);
                response.db.close();
                this._request = {};
            });
        }, callback)
    },
    update: function(callback){
        execute.bind(this)(function(callback, response){
            var updateObj = {};
            updateObj.$set = this.set;
            updateObj.$currentDate = {lastModified: true};
            response.collection.update(response.condition, updateObj, function (err, docs) {
                callback(err, docs);
                response.db.close();
                this._request = {};
                this._setData = {};
            });
        }, callback)
    },
    insert: function(newRecord, callback){
        execute.bind(this)(function(callback, response){
            response.collection.insert(newRecord, function (err, docs) {
                callback(err, docs);
                response.db.close();
                this._request = {};
            });
        }, callback)
    }
};

var addCondition = function (operator, value) {
    var conditionParameter = {};
    this._request[this.conditionWord] = conditionParameter;
    conditionParameter[operator] = value;
    this._denial = false;
    return this;
}.bind(multivarka);

module.exports = multivarka;

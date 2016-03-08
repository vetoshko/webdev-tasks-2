const MongoClient = require('mongodb').MongoClient;

function addCondition(object, goodOperator, badOperator, value) {
    var conditionParameter = {};
    if (object.denial) {
        conditionParameter[badOperator] = value;
        object.request[object.conditionWord] = conditionParameter;
        object.denial = false;
    } else {
        conditionParameter[goodOperator] = value;
        object.request[object.conditionWord] = conditionParameter;
    }
    return object;
};

function connectToMongo(obj, callback) {
    MongoClient.connect(obj.url, function (err, db) {
        if (err) {
            callback(err);
        } else {
            var currentCollection = db.collection(obj.collectionName.toString());
            callback(null, currentCollection, db, obj.request);
        }
    });
};

module.exports = {
    server: function (uri) {
        this.url = uri;
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
        return addCondition(this, '$eq', '$gte', value);
    },
    lessThan: function (value) {
        return addCondition(this, '$lt', '$ne', value);
    },
    greatThan: function (value) {
        return addCondition(this, '$ge', '$lte', value);
    },
    include: function (values) {
        return addCondition(this, '$in', '$nin', values);
    },
    remove: function(callback) {
        connectToMongo(this, function (err, collection, db, condition) {
            if (err) {
                callback(err);
            } else {
                collection.deleteMany(condition, function (err, docs) {
                    callback(err, docs);
                    db.close();
                    this.request = {};
                });
            }
        });
    },
    find: function (callback) {
        connectToMongo(this, function (err, collection, db, condition) {
            if (err) {
                callback(err);
            } else {
                collection.find(condition).toArray(function (err, docs) {
                    callback(err, docs);
                    db.close();
                    this.request = {};
                });
            }
        });
    },
    update: function (callback) {
        connectToMongo(this, function (err, collection, db, condition) {
            if (err) {
                callback(err);
            } else {
                var updateObj = {};
                updateObj.$set = this.set;
                updateObj.$currentDate = {lastModified: true};
                collection.update(condition, updateObj, function (err, docs) {
                    callback(err, docs);
                    db.close();
                    this.request = {};
                    this.setData = {};
                });
            }
        });
    },
    insert: function (newRecord, callback) {
        connectToMongo(this, function (err, collection, db, condition) {
            if (err) {
                callback(err);
            } else {
                collection.insert(newRecord, function (err, docs) {
                    callback(err, docs);
                    db.close();
                    this.request = {};
                });
            }
        });
    }
};

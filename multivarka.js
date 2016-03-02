const MongoClient = require('mongodb').MongoClient;

module.exports = {
    server: function (uri) {
        this.url = uri;
        this.request = {};
        this.not = false;
        return this;
    },
    collection: function (collectionName) {
        this.collection = collectionName;
        return this;
    },
    where: function (conditionWord) {
        this.conditionWord = conditionWord;
        return this;
    },
    equal: function (value) {
        if (this.not) {
            this.request[this.conditionWord] = {$ne: value};
            this.not = false;
        } else {
            this.request[this.conditionWord] = {$eq: value};
        };
        return this;
    },
    lessThan: function (value) {
        if (this.not) {
            this.request[this.conditionWord] = {$gte: value};
            this.not = false;
        } else {
            this.request[this.conditionWord] = {$lt: value};
        };
    },
    greatThan: function (value) {
        if (this.not) {
            this.request[this.conditionWord] = {$lte: value};
            this.not = false;
        } else {
            this.request[this.conditionWord] = {$ge: value};
        };
    },
    include: function (values) {
        if (this.not) {
            this.request[this.conditionWord] = {$nin: value};
            this.not = false;
        } else {
            this.request[this.conditionWord] = {$in: value};
        };
    },
    find: function (callback) {
        var obj = this;
        MongoClient.connect(this.url, function (err, db) {
            if (err) {
                callback(err);
            } else {
                var collection = db.collection(obj.collection.toString());
                collection.find(obj.request).toArray(function (err, docs) {
                    callback(err, docs);
                    db.close();
                });
            };
        });
    }
};

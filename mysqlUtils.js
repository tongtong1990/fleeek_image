const Q = require('q');

const username = 'fleeekio';
const pwd = 'fleeekio';
const host = 'fleeekio.cdcu5rcw6b67.us-east-2.rds.amazonaws.com';
const db = 'fleeekio';

var createConnection = function() {
    return {
        host: host,
        port: 3306,
        user: username,
        password: pwd,
        database: db
    };
};

var queryPromise = function(conn, query, params) {
    var deferred = Q.defer();
    conn.query(query, params, function(error, result, field) {
        if (error) deferred.reject(new Error(error));
        else deferred.resolve(result);
    });
    return deferred.promise;
};

module.exports.createConnection = createConnection;
module.exports.queryPromise = queryPromise;
const mysql = require('mysql');
const util = require('util');
config = {
    connectionLimit: 10,
    host: 'aws-stopandgopag.c0d52k5dubhb.us-east-2.rds.amazonaws.com',
    user: 'admin',
    password: 'Giuseppe98!',
    database: 'aws-stopandgopag',
    multipleStatements: true
};

exports.makeDb = async function(config) {

    let pool = mysql.createPool(config);

    
    let getConnection = () => {
        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                console.log("connessione creata");
                if (err) {
                    return reject(err);
                }
                resolve(connection);
            });
        });
    };


    const connection = await getConnection();

    return {
        query(sql, args) {
            return util.promisify(connection.query)
                .call(connection, sql, args);
        },
        connRelease() {
            return util.promisify(connection.release)
                .call(connection);
        },
        beginTransaction() {
            return util.promisify(connection.beginTransaction)
                .call(connection);
        },
        commit() {
            return util.promisify(connection.commit)
                .call(connection);
        },
        rollback() {
            return util.promisify(connection.rollback)
                .call(connection);
        },
        end() {
            return pool.end.call(pool);
        }
    };
}

exports.withTransaction = async function(db, callback) {
    try {
        await db.beginTransaction();
        await callback();
        await db.commit();
    } catch (err) {
        await db.rollback();
        throw err;
    } finally {
        db.end();
    }
}
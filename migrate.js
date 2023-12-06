const SimplDB = require('simpl.db');
const path = require('path');

const dbpath = path.resolve('./db/');
const db = new SimplDB({
    dataFile: path.join(dbpath, 'db.json'),
    collectionsFolder: path.join(dbpath, 'collections'),
});

const optOutDB = db.createCollection('optedout');

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/songlinker.db'
});

const OptedOut = sequelize.define('OptedOut', {
    UserID: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
});

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        await sequelize.sync();

        optOutDB.getAll().forEach(user => {
            OptedOut.create({ UserID: user.user });
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();




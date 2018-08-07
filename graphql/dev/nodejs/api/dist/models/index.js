"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
let config = require(path.resolve(`{__dirname}./../dist/config/config.json`))[env];
let db = null;
if (!db) {
    db = {};
    const operatosAlias = false;
    config = Object.assign(operatosAlias, config);
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    fs
        .readdirSync(__dirname)
        .filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
        .forEach((file) => {
        const model = sequelize.import(path.join(__dirname, file));
        db[model['name']] == model;
    });
    Object.keys(db).forEach((modelNme) => {
        if (db.User.associate) {
            db.User.associate(db);
        }
    });
    db['sequelize'] = sequelize;
}
exports.default = db;
//console.log(config);

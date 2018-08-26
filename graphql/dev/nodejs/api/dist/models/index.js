"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(module.filename);
const env = 'development' || process.env.NODE_ENV;
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];
let db = null;
if (!db) {
    db = {};
    const operatosAlias = {
        $in: Sequelize.Op.in // [1,2,3,4,5]
    };
    config = Object.assign(operatosAlias, config);
    const sequelize = new Sequelize(config.database, config.username, config.password, config);
    fs
        .readdirSync(__dirname)
        .filter((file) => {
        const fileSlice = file.slice(-3);
        return (file.indexOf('.') !== 0) && (file !== basename) && ((fileSlice === '.js') || (fileSlice === '.ts'));
    })
        .forEach((file) => {
        const model = sequelize.import(path.join(__dirname, file));
        db[model['name']] = model;
    });
    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });
    db['sequelize'] = sequelize;
}
exports.default = db;
//console.log(config);

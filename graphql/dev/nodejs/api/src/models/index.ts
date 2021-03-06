import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';

import { DbConnection } from '../interfaces/DbConnectionIterface';

const basename: string = path.basename(module.filename);
const env: string = 'development' || process.env.NODE_ENV;
let config = require(path.resolve(`${__dirname}./../config/config.json`))[env];
let db = null;

if (!db) {
    db = {};

    const operatosAlias = {
        $in: Sequelize.Op.in // [1,2,3,4,5]
    };

    config = Object.assign(operatosAlias, config);

    const sequelize: Sequelize.Sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config
    );

    fs
        .readdirSync(__dirname)
        .filter((file: string) => {
            const fileSlice: string = file.slice(-3);
            return (file.indexOf('.') !== 0) && (file !== basename) && ((fileSlice === '.js') || (fileSlice === '.ts'));
        })
        .forEach((file: string) => {
            const model = sequelize.import(path.join(__dirname, file));
            db[model['name']] = model;
        });

    Object.keys(db).forEach((modelName: string) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db['sequelize'] = sequelize;
}

export default <DbConnection>db;


//console.log(config);

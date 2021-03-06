import * as Sequelize from 'sequelize';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';

import { BaseModelInterface } from "../interfaces/BaseModelInterface";
import { ModelsInterface } from '../interfaces/ModelsInterface';
import { ECONNABORTED } from 'constants';

export interface UserAttributes {
    id?: number;
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
    createdDate?: string;
    updatedDate?: string;
}

export interface UserInstance extends Sequelize.Instance<UserAttributes>, UserAttributes {
    isPassword(encodedPass: string, password: string): boolean;
}

export interface UserModel extends BaseModelInterface, Sequelize.Model<UserInstance, UserAttributes> {

}

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): UserModel => {
    const User: UserModel = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: { notEmpty: true }
        },
        photo: {
            type: DataTypes.BLOB({
                length: 'long'
            }),
            allowNull: true,
            defaultValue: null
        }
    },
        {
            tableName: 'users',
            hooks: {
                beforeCreate: (user: UserInstance, options: Sequelize.CreateOptions): void => {

                    const salt = genSaltSync();
                    user.password = hashSync(user.password, salt);

                },

                beforeUpdate: (user: UserInstance, options: Sequelize.CreateOptions): void => {
                    if (user.changed('password')) {
                        const salt = genSaltSync();
                        user.password = hashSync(user.password, salt);
                    }
                }
            }
        }
    );

    User.associate = (models: ModelsInterface): void => { };

    User.prototype.isPassword = (encodedPass: string, password: string): boolean => {
        console.log('UserModel isPassword = ' + encodedPass)
        return compareSync(password, encodedPass);
    };

    return User;
};
import * as Sequelize from 'sequelize';

import { BaseModelInterface } from '../interfaces/BaseModelInterface';
import { ModelsInterface } from './../interfaces/ModelsInterface';

export interface PostAttributes {
    id?: number;
    title?: string;
    content?: string;
    photo?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PostInstance extends Sequelize.Instance<PostAttributes> { }

export interface PostModel extends BaseModelInterface, Sequelize.Model<PostInstance, PostAttributes> { };

export default (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes): PostModel => {
    const Post: PostModel = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true
        },
        photo: {
            type: DataTypes.BLOB({
                length: 'long'
            }),
            allowNull: true,
            defaultValue: null
        }
    }, {
            tableName: 'posts'
    });

    Post.associate = (models: ModelsInterface): void => {
        Post.belongsTo(models.User, {
            foreignKey: {
                allowNull: false,
                field: 'author',
                name: 'author'
            }
        });
    };

    return Post;
};
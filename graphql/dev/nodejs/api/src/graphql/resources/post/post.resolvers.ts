import * as graphqlields from 'graphql-fields';

import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { DbConnection } from "../../../interfaces/DbConnectionIterface";
import { PostInstance } from "../../../models/PostModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/authResolver";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

export const postResolvers = {
    Post: {
        author: (post, { first = 10, offset = 0 }, { db, dataloaders: { userLoader } }: { db: DbConnection, dataloaders: DataLoaders }, info: GraphQLResolveInfo) => {
            return userLoader
                .load({
                    key: post.get('author'),
                    info
                }
                )
                .catch(handleError);
            // return db.User
            //     .findById(post.get('author'))
            //     .catch(handleError);
        },

        comments: (post, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            return context.db.Comment.findAll({
                where: { post: post.get('id') },
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            })
                .catch(handleError);
        },
    },

    Query: {
        posts: (parent, { first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            console.log(Object.keys(graphqlields(info)));
            return context.db.Post.findAll({
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
            })
                .catch(handleError);
        },

        post: (parent, { id }, context: ResolverContext, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return context.db.Post
                .findById(id, {
                    attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
                })
                .then((post: PostInstance) => {
                    throwError(!post, `Post com o id: ${id} não foi encontrado`);
                    return post;
                })
                .catch(handleError);
        }
    },

    Mutation: {

        createPost: compose(...authResolvers)((parent, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            input.author = authUser.id
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .create(input, { transaction: t });
            })
                .catch(handleError);
        }),

        updatePost: compose(...authResolvers)((parent, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Post
                    .findById(id)
                    .then((post: PostInstance) => {
                        throwError(!post, `Post com id: ${id} não encontrado`);
                        throwError(post.get('author') != authUser.id, `Unauthorized!`);
                        input.author = authUser.id;
                        return post.update(input, { transaction: t });
                    })
                    .catch(handleError);
            })
        }),

        deletePost: compose(...authResolvers)((parent, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((post: PostInstance) => {
                        throwError(!post, `Post com id: ${id} não encontrado`);
                        throwError(post.get('author') != authUser.id, `Unauthorized!`);

                        return post
                            .destroy({ transaction: t })
                            .then(post => !!post);
                    }).catch(handleError);
            })
        })
    }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphqlields = require("graphql-fields");
const utils_1 = require("../../../utils/utils");
const composable_resolver_1 = require("../../composable/composable.resolver");
const authResolver_1 = require("../../composable/authResolver");
exports.postResolvers = {
    Post: {
        author: (post, { first = 10, offset = 0 }, { db, dataloaders: { userLoader } }, info) => {
            return userLoader
                .load({
                key: post.get('author'),
                info
            })
                .catch(utils_1.handleError);
            // return db.User
            //     .findById(post.get('author'))
            //     .catch(handleError);
        },
        comments: (post, { first = 10, offset = 0 }, context, info) => {
            return context.db.Comment.findAll({
                where: { post: post.get('id') },
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            })
                .catch(utils_1.handleError);
        },
    },
    Query: {
        posts: (parent, { first = 10, offset = 0 }, context, info) => {
            console.log(Object.keys(graphqlields(info)));
            return context.db.Post.findAll({
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['comments'] })
            })
                .catch(utils_1.handleError);
        },
        post: (parent, { id }, context, info) => {
            id = parseInt(id);
            return context.db.Post
                .findById(id, {
                attributes: context.requestedFields.getFields(info, { keep: ['id'], exclude: ['posts'] })
            })
                .then((post) => {
                utils_1.throwError(!post, `Post com o id: ${id} não foi encontrado`);
                return post;
            })
                .catch(utils_1.handleError);
        }
    },
    Mutation: {
        createPost: composable_resolver_1.compose(...authResolver_1.authResolvers)((parent, { input }, { db, authUser }, info) => {
            input.author = authUser.id;
            return db.sequelize.transaction((t) => {
                return db.Post
                    .create(input, { transaction: t });
            })
                .catch(utils_1.handleError);
        }),
        updatePost: composable_resolver_1.compose(...authResolver_1.authResolvers)((parent, { id, input }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Post
                    .findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `Post com id: ${id} não encontrado`);
                    utils_1.throwError(post.get('author') != authUser.id, `Unauthorized!`);
                    input.author = authUser.id;
                    return post.update(input, { transaction: t });
                })
                    .catch(utils_1.handleError);
            });
        }),
        deletePost: composable_resolver_1.compose(...authResolver_1.authResolvers)((parent, { id, input }, { db, authUser }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((post) => {
                    utils_1.throwError(!post, `Post com id: ${id} não encontrado`);
                    utils_1.throwError(post.get('author') != authUser.id, `Unauthorized!`);
                    return post
                        .destroy({ transaction: t })
                        .then(post => !!post);
                }).catch(utils_1.handleError);
            });
        })
    }
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../../utils/utils");
const composable_resolver_1 = require("../../composable/composable.resolver");
const authResolver_1 = require("../../composable/authResolver");
exports.userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post.findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        }
    },
    Query: {
        users: composable_resolver_1.compose(...authResolver_1.authResolvers)((parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.User
                .findAll({
                limit: first,
                offset: offset
            })
                .catch(utils_1.handleError);
        }),
        user: (parent, { id }, { db }, info) => {
            id = parseInt(id);
            return db.User
                .findById(id)
                .then((user) => {
                if (!user)
                    throw new Error(`Usuário com id: ${id} não encontrado`);
                return user;
            })
                .catch(utils_1.handleError);
        },
        currentUser: composable_resolver_1.compose(...authResolver_1.authResolvers)((parent, args, { db, authUser }, info) => {
            return db.User
                .findById(authUser.id)
                .then((user) => {
                utils_1.throwError(!user, `User with id ${authUser.id} not found!`);
                return user;
            }).catch(utils_1.handleError);
        })
    },
    Mutation: {
        createUser: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .create(input, { transaction: t });
            }).catch(utils_1.handleError);
        },
        updateUser: (parent, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `Usuário com id: ${authUser.id} não encontrado`);
                    return user.update(input, { transaction: t });
                });
            })
                .catch(utils_1.handleError);
        },
        updateUserPassword: (parent, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `Usuário com id: ${authUser.id} não encontrado`);
                    return user
                        .update(input, { transaction: t })
                        .then((user) => !!user);
                });
            })
                .catch(utils_1.handleError);
        },
        deleteUser: (parent, { input }, { db, authUser }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(authUser.id)
                    .then((user) => {
                    utils_1.throwError(!user, `Usuário com id: ${authUser.id} não encontrado`);
                    return user
                        .destroy({ transaction: t })
                        .then(user => !!user);
                });
            })
                .catch(utils_1.handleError);
        }
    }
};

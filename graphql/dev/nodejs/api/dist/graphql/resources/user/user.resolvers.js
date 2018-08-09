"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userResolvers = {
    User: {
        posts: (user, { first = 10, offset = 0 }, { db }, info) => {
            return db.Post.findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset
            });
        }
    },
    Query: {
        users: (parent, { first = 10, offset = 0 }, { db }, info) => {
            return db.User
                .findAll({
                limit: first,
                offset: offset
            });
        },
        user: (parent, { id }, { db }, info) => {
            return db.User
                .findById(id)
                .then((user) => {
                if (!user)
                    throw new Error(`Usuário com id: ${id} não encontrado`);
                return user;
            });
        }
    },
    Mutation: {
        createUser: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.User.create(input, { transaction: t });
            });
        },
        updateUser: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`Usuário com id: ${id} não encontrado`);
                    return user.update(input, { transaction: t });
                });
            });
        },
        updateUserPassword: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`Usuário com id: ${id} não encontrado`);
                    return user
                        .update(input, { transaction: t })
                        .then((user) => !!user);
                });
            });
        },
        deleteUser: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.User
                    .findById(id)
                    .then((user) => {
                    if (!user)
                        throw new Error(`Usuário com id: ${id} não encontrado`);
                    return user
                        .destroy({ transaction: t })
                        .then(user => !!user);
                });
            });
        }
    }
};

import { GraphQLResolveInfo } from 'graphql';
import { Transaction } from 'sequelize';

import { AuthUser } from '../../../interfaces/AuthUserInterface';
import { DbConnection } from "../../../interfaces/DbConnectionIterface";
import { UserInstance } from "../../../models/UserModel";
import { handleError, throwError } from "../../../utils/utils";
import { compose } from '../../composable/composable.resolver';
import { authResolvers } from '../../composable/authResolver';
import { ResolverContext } from '../../../interfaces/ResolverContextInterface';

export const userResolvers = {

    User: {
        posts: (user, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post.findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset
            })
                .catch(handleError);
        }
    },

    Query: {
        users: compose(...authResolvers)((parent, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findAll({
                    limit: first,
                    offset: offset
                })
                .catch(handleError);

        }),

        user: (parent, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.User
                .findById(id)
                .then((user: UserInstance) => {
                    if (!user) throw new Error(`Usuário com id: ${id} não encontrado`);
                    return user;
                })
                .catch(handleError);

        },

        currentUser: compose(...authResolvers)((parent, args, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.User
                .findById(authUser.id)
                .then((user: UserInstance) => {
                    throwError(!user, `User with id ${authUser.id} not found!`);
                    return user;
                }).catch(handleError);
        })
    },

    Mutation: {
        createUser: (parent, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .create(input, { transaction: t });
            }).catch(handleError);
        },

        updateUser: (parent, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `Usuário com id: ${authUser.id} não encontrado`);
                        return user.update(input, { transaction: t });
                    });
            })
                .catch(handleError);
        },

        updateUserPassword: (parent, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `Usuário com id: ${authUser.id} não encontrado`);
                        return user
                            .update(input, { transaction: t })
                            .then((user: UserInstance) => !!user);
                    });
            })
                .catch(handleError);
        },

        deleteUser: (parent, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(authUser.id)
                    .then((user: UserInstance) => {
                        throwError(!user, `Usuário com id: ${authUser.id} não encontrado`);
                        return user
                            .destroy({ transaction: t })
                            .then(user => !!user);
                    });
            })
                .catch(handleError);
        }
    }
}
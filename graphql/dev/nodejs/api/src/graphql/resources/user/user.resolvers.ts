import { GraphQLResolveInfo } from "graphql";
import { DbConnection } from "../../../interfaces/DbConnectionIterface";
import { UserInstance } from "../../../models/UserModel";
import { throwError } from "../../../utils/utils";
import { Transaction } from "../../../../node_modules/@types/sequelize";
import { INPUT_OBJECT_TYPE_DEFINITION } from "../../../../node_modules/@types/graphql/language/kinds";

export const userResolvers = {

    User: {
        posts: (user, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post.findAll({
                where: { author: user.get('id') },
                limit: first,
                offset: offset
            })
        }
    },

    Query: {
        users: (parent, { first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findAll({
                    limit: first,
                    offset: offset
                });
        },

        user: (parent, { id }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findById(id)
                .then((user: UserInstance) => {
                    if (!user) throw new Error(`Usuário com id: ${id} não encontrado`);
                    return user;
                })
        }
    },

    Mutation: {
        createUser: (parent, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.User.create(input, { transaction: t });
            })
        },

        updateUser: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`Usuário com id: ${id} não encontrado`);
                        return user.update(input, { transaction: t });

                    });
            })
        },

        updateUserPassword: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`Usuário com id: ${id} não encontrado`);
                        return user
                            .update(input, { transaction: t })
                            .then((user: UserInstance) => !!user);

                    });
            })
        },

        deleteUser: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.User
                    .findById(id)
                    .then((user: UserInstance) => {
                        if (!user) throw new Error(`Usuário com id: ${id} não encontrado`);
                        return user
                            .destroy({ transaction: t })
                            .then(user => !!user);
                    });
            })
        }

    }
}
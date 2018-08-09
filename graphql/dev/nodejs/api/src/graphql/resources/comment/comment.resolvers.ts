import { DbConnection } from "../../../interfaces/DbConnectionIterface";

import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "../../../../node_modules/@types/sequelize";
import { CommentInstance } from "../../../models/CommentModel";

export const commentResolvers = {
    Comment: {
        user: (comment, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.User
                .findById(comment.get('user'))
        },

        post: (comment, args, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Post
                .findById(comment.get('post'))
        },
    },

    Query: {
        commentsByPost: (post, { postId, first = 10, offset = 0 }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.Comment.findAll({
                where: { post: post.get('id') },
                limit: first,
                offset: offset
            });

        }
    },

    Mutation: {
        createComment: (parent, { input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, { transaction: t });
            })
        },

        updatePost: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        if (!comment) throw new Error(`Comment com id: ${id} não encontrado`);
                        return comment.update(input, { transaction: t });

                    });
            })
        },

        deletePost: (parent, { id, input }, { db }: { db: DbConnection }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        if (!comment) throw new Error(`Comment com id: ${id} não encontrado`);
                        return comment
                            .destroy({ transaction: t })
                            .then(comment => !!comment);
                    });
            })
        }
    }
}
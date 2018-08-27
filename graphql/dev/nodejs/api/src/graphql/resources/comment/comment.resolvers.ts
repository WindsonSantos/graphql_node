
import { GraphQLResolveInfo } from "graphql";
import { Transaction } from "sequelize";

import { DbConnection } from "../../../interfaces/DbConnectionIterface";
import { CommentInstance } from "../../../models/CommentModel";
import { handleError, throwError } from "../../../utils/utils";
import { AuthUser } from "../../../interfaces/AuthUserInterface";
import { compose } from "../../composable/composable.resolver";
import { authResolvers } from "../../composable/authResolver";
import { DataLoaders } from "../../../interfaces/DataLoadersInterface";
import { ResolverContext } from "../../../interfaces/ResolverContextInterface";

export const commentResolvers = {
    Comment: {
        user: (comment, args, { db, dataloaders: { userLoader } }: { db: DbConnection, dataloaders: DataLoaders }, info: GraphQLResolveInfo) => {
            return userLoader
                .load({
                    key: comment.get('user'),
                    info
                }
                )
                .catch(handleError);

        },

        post: (comment, args, { db, dataloaders: { postLoader } }: { db: DbConnection, dataloaders: DataLoaders }, info: GraphQLResolveInfo) => {
            return postLoader
                .load({
                    key: comment.get('post'),
                    info
                }
                )
                .catch(handleError);

        },
    },

    Query: {
        commentsByPost: (post, { postId, first = 10, offset = 0 }, context: ResolverContext, info: GraphQLResolveInfo) => {
            postId = parseInt(postId);
            return context.db.Comment.findAll({
                where: { post: postId },
                limit: first,
                offset: offset,
                attributes: context.requestedFields.getFields(info)
            })
                .catch(handleError);
        }
    },

    Mutation: {
        createComment: compose(...authResolvers)((parent, { input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            input.user = authUser.id;
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .create(input, { transaction: t })
                    .catch(handleError);

            })
        }),

        updateComment: compose(...authResolvers)((parent, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment com id: ${id} não encontrado`);
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only edit comments by yourself  `);
                        input.user = authUser.id;
                        return comment.update(input, { transaction: t });
                    })
                    .catch(handleError);
                ;
            })
        }),

        deleteComment: compose(...authResolvers)((parent, { id, input }, { db, authUser }: { db: DbConnection, authUser: AuthUser }, info: GraphQLResolveInfo) => {
            id = parseInt(id);
            return db.sequelize.transaction((t: Transaction) => {
                return db.Comment
                    .findById(id)
                    .then((comment: CommentInstance) => {
                        throwError(!comment, `Comment com id: ${id} não encontrado`);
                        throwError(comment.get('user') != authUser.id, `Unauthorized! You can only delete comments by yourself `);
                        return comment
                            .destroy({ transaction: t })
                            .then(comment => !!comment);
                    })
                    .catch(handleError);
            })
        })
    }
}
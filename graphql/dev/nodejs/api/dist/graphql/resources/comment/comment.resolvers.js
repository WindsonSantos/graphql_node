"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentResolvers = {
    Comment: {
        user: (comment, args, { db }, info) => {
            return db.User
                .findById(comment.get('user'));
        },
        post: (comment, args, { db }, info) => {
            return db.Post
                .findById(comment.get('post'));
        },
    },
    Query: {
        commentsByPost: (post, { postId, first = 10, offset = 0 }, { db }, info) => {
            return db.Comment.findAll({
                where: { post: post.get('id') },
                limit: first,
                offset: offset
            });
        }
    },
    Mutation: {
        createComment: (parent, { input }, { db }, info) => {
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .create(input, { transaction: t });
            });
        },
        updatePost: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    if (!comment)
                        throw new Error(`Comment com id: ${id} não encontrado`);
                    return comment.update(input, { transaction: t });
                });
            });
        },
        deletePost: (parent, { id, input }, { db }, info) => {
            id = parseInt(id);
            return db.sequelize.transaction((t) => {
                return db.Comment
                    .findById(id)
                    .then((comment) => {
                    if (!comment)
                        throw new Error(`Comment com id: ${id} não encontrado`);
                    return comment
                        .destroy({ transaction: t })
                        .then(comment => !!comment);
                });
            });
        }
    }
};

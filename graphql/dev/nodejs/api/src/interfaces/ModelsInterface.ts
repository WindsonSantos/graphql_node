import { CommentModel } from "../models/CommentModel";
import { PostModel } from "../models/PostModel";
import { UserModel } from "../models/UserModel";

export interface ModelsInterface {
    Post:PostModel;
    Comment:CommentModel;
    User:UserModel;
}
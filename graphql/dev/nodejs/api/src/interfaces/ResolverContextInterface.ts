import { DbConnection } from "./DbConnectionIterface";
import { AuthUser } from "./AuthUserInterface";

export interface ResolverContext {

    db?: DbConnection;
    authorization?: string;
    authUser?: AuthUser;
    //dataloaders?: DataLoaders;
    //requestedFields?: RequestedFields;
}
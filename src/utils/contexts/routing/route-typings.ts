export enum AppDomains {
    CLUSTER = "cluster",
    FOCALAREA = "focalarea",
    POST = "post",
    USER = "user",
    AUTH = "auth",
    CATEGORY = "category",
    CONFERENCE = "conference"
}

export interface IRouteGroup {
    cluster: IRoute[];
    focalarea: IRoute[];
    post: IRoute[];
    user: IRoute[];
    auth: IRoute[];
    conference: IRoute[];
}

export interface IRoute {
    path: string;
    element: () => JSX.Element;
    isAdmin: boolean;
    isAuth: boolean;
    appDomain: AppDomains;
    props?: {[key: string]: string};
}



import { RequestForgotPassword } from "../../../auth/pages/ForgotPassword";
import { LoginUser } from "../../../auth/pages/Login";
import { RegisterUser } from "../../../auth/pages/Register";
import { VerifyEmailToken } from "../../../auth/pages/VerifyEmail";
import { CreateUserInStages } from "../../../auth/pages/CreateUser";
import { CategoryMgt } from "../../../category/pages/CategoryMgt";
import { ClusterMgt } from "../../../cluster/pages/ClusterMgt";
import { FocalareaMgt } from "../../../focalarea/pages/FocalareaMgt";
import { CreateOrUpdatePost } from "../../../post/pages/CreateAndUpdatePost";
import { PostMgt } from "../../../post/pages/PostMgt";
import { UserMgt } from "../../../user/pages/UserMgt";
import { AppDomains, IRoute, IRouteGroup } from "./route-typings";
import { UserProfile } from "../../../user/pages/UserProfile";
import { Post } from "../../../post/pages/public/Post";
import { Cluster } from "../../../cluster/pages/public/Cluster";
import { Clusters } from "../../../cluster/pages/public/Clusters";
import { Focalareas } from "../../../focalarea/pages/public/Focalareas";
import { Focalarea } from "../../../focalarea/pages/public/Focalarea";
import { Users } from "../../../user/pages/Users";
import { Posts } from "../../../post/pages/public/Posts";
import { CreatePostInStages } from "../../../post/pages/public/CreatePost";

export const AppDomainsArr: string[] = [
    "cluster", "category", "focalarea","auth", "post", "user"
]

export const allRoutes: IRoute[] = [
    {
        path: "register",
        element: RegisterUser,
        appDomain: AppDomains.AUTH,
        isAdmin: false,
        isAuth: false
    },{
        path: "create/:userId",
        element: CreateUserInStages,
        appDomain: AppDomains.USER,
        isAdmin: false,
        isAuth: false
    },{
        path: "profile/:userId",
        element: UserProfile,
        appDomain: AppDomains.USER,
        isAdmin: false,
        isAuth: true
    },{
        path: "viewpost/:postId",
        element: Post,
        appDomain: AppDomains.POST,
        isAdmin: false,
        isAuth: false
    },{
        path: "view/:clusterId",
        element: Cluster,
        appDomain: AppDomains.CLUSTER,
        isAdmin: false,
        isAuth: false
    },{
        path: "clusters",
        element: Clusters,
        appDomain: AppDomains.CLUSTER,
        isAdmin: false,
        isAuth: false
    },{
        path: "focalareas",
        element: Focalareas,
        appDomain: AppDomains.FOCALAREA,
        isAdmin: false,
        isAuth: false
    },{
        path: "/view/:focalareaId",
        element: Focalarea,
        appDomain: AppDomains.FOCALAREA,
        isAdmin: false,
        isAuth: false
    },
    {
        path: "login",
        element: LoginUser,
        appDomain: AppDomains.AUTH,
        isAdmin: false,
        isAuth: false
    },
    {
        path: "users",
        element: Users,
        appDomain: AppDomains.USER,
        isAdmin: false,
        isAuth: false
    },
    {
        path: "posts",
        element: Posts,
        appDomain: AppDomains.POST,
        isAdmin: false,
        isAuth: false
    },
    {
        path: "verify-user",
        element: VerifyEmailToken,
        appDomain: AppDomains.AUTH,
        isAdmin: false,
        isAuth: false
    },
    {
        path: "forgot-password",
        element: RequestForgotPassword,
        appDomain: AppDomains.AUTH,
        isAdmin: false,
        isAuth: false
    },
    {
        path: "cluster-mgt",
        element: ClusterMgt,
        appDomain: AppDomains.CLUSTER,
        isAdmin: true,
        isAuth: true
    },{
        path: "category-mgt",
        element: CategoryMgt,
        appDomain: AppDomains.CATEGORY,
        isAdmin: true,
        isAuth: true
    },{
        path: "user-mgt",
        element: UserMgt,
        appDomain: AppDomains.USER,
        isAdmin: true,
        isAuth: true
    },
    {
        path: "focalarea-mgt",
        element: FocalareaMgt,
        appDomain: AppDomains.FOCALAREA,
        isAdmin: true,
        isAuth: true
    },
    {
        path: "post-mgt",
        element: PostMgt,
        appDomain: AppDomains.POST,
        isAdmin: true,
        isAuth: true
    },
    {
        path: "post-mutate/:postId",
        element: CreateOrUpdatePost,
        appDomain: AppDomains.POST,
        isAdmin: true,
        isAuth: true
    },
    {
        path: "create/:postId",
        element: CreatePostInStages,
        appDomain: AppDomains.POST,
        isAdmin: false,
        isAuth: true
    },
    {
        path: "view/:postId",
        element: Post,
        appDomain: AppDomains.POST,
        isAdmin: false,
        isAuth: true
    }
]

export const adminRoutes = allRoutes.filter((route) => route.isAdmin);
export const userRoutes = allRoutes.filter((route) => !route.isAdmin);
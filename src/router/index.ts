import { createRouter, createWebHistory } from 'vue-router'

import UserHome from '@/views/userHome/Index.vue'
import PostList from '@/components/userHome/PostList.vue'
import CategoryList from '@/components/userHome/CategoryList.vue'
import ShareList from '@/components/userHome/ShareList.vue'
import CollectList from '@/components/userHome/CollectList.vue'
import CollectDetail from '@/components/userHome/CollectDetail.vue'
import LikeList from '@/components/userHome/LikeList.vue'
import BrowseList from '@/components/userHome/BrowseList.vue'
import Personal from '@/views/personal/Index.vue'
import Profile from '@/components/personal/Profile.vue'
import AccountSetting from '@/components/personal/AccountSetting.vue'
import MyLikes from '@/components/personal/MyLikes.vue'
import MyCollect from '@/components/personal/MyCollect.vue'
import MyBrowse from '@/components/personal/MyBrowse.vue'
import LevelCenterIndex from '@/views/levelCenter/index.vue'
import VipCenterIndex from '@/views/vipCenter/index.vue'
import EditProfile from '@/components/personal/EditProfile.vue'
import MessageCenterIndex from '@/views/messageCenter/index.vue'
import MyMessage from '@/components/messageCenter/MyMessage.vue'
import MyComment from '@/components/messageCenter/MyComment.vue'
import MyNewFan from '@/components/messageCenter/MyNewFan.vue'
import MyLikeAndCollect from '@/components/messageCenter/MyLikeAndCollect.vue'
import OtherUserHomeIndex from '@/views/userHome/otherUserHome/Index.vue'
import OtherPostList from '@/components/userHome/otherUserHome/OtherPostList.vue'
import OtherCategoryList from '@/components/userHome/otherUserHome/OtherCategoryList.vue'
import OtherShareList from '@/components/userHome/otherUserHome/OtherShareList.vue'
import OtherCollectList from '@/components/userHome/otherUserHome/OtherCollectList.vue'
import OtherCollectDetail from '@/components/userHome/otherUserHome/OtherCollectDetail.vue'
import OtherLikeList from '@/components/userHome/otherUserHome/OtherLikeList.vue'
import OtherBrowseList from '@/components/userHome/otherUserHome/OtherBrowseList.vue'
import CategoryDetail from '@/components/userHome/CategoryDetail.vue'
import OtherCategoryDetail from '@/components/userHome/otherUserHome/OtherCategoryDetail.vue'
import HomePageIndex from '@/views/homePage/index.vue'
import HomeIndex from '@/views/homePage/HomeIndex.vue'
import HomeNews from '@/views/homePage/HomeNews.vue'
import HomeShares from '@/views/homePage/HomeShares.vue'
import EditorPage from '@/views/editorPage/EditorPage.vue'
import RecommendUser from '@/components/homePage/recommendUser/RecommendUser.vue'
import HomeFocus from '@/views/homePage/HomeFocus.vue'
import FocusAndFansList from '../../src/components/userHome/FocusAndFansList.vue'
import PublishShare from '@/components/editorPage/publishShare/PublishShare.vue'
import EditShare from '@/components/editorPage/publishShare/EditShare.vue'
import ShareView from '@/components/viewPage/share/ShareView.vue'
import PublishSuccess from '@/components/public/PublishSuccess.vue'
import ViewPage from '@/views/viewPage/index.vue'
import EditPostPage from '@/views/editorPage/EditPostPage.vue'
import SearchPage from '@/views/searchPage/index.vue'
import AiPage from '@/views/aiPage/index.vue'
import LoginPage from '@/views/loginPage/index.vue'
import CreatorCenterIndex from '@/views/creatorCenter/index.vue'
import HomeDownloads from '@/components/homePage/DowmLoadContent.vue'
import HomeStudy from '@/components/homePage/StudyContent.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    /**
     * 重定向
     */
    { path: '/', redirect: '/homePage' }, // 重定向到用户主页
    /**
     * AI对话
     */
    {
      path: '/ai',
      component: AiPage,
      name: 'ai'
    },
    /**
     * 首页
     */
    {
      path: '/homePage',
      component: HomePageIndex,
      redirect: '/homePage/index',
      children: [
        { path: 'index', component: HomeIndex },
        { path: 'news', component: HomeNews },
        { path: 'downloads', component: HomeDownloads },
        { path: 'study', component: HomeStudy },
        { path: 'shares', component: HomeShares },
        { path: 'focus', component: HomeFocus },
      ]
    },
    /**
     * 用户主页
     */
    {
      path: '/userHome',
      component: UserHome,
      redirect: '/userHome/postList',
      children: [
        { path: 'postList', component: PostList },
        { path: 'categoryList', component: CategoryList },
        { path: 'shareList', component: ShareList },
        {
          path: 'collectList',
          component: CollectList,
          children: [
            {
              path: ':favoriteId',
              component: CollectDetail
            }
          ]
        },
        { path: 'likeList', component: LikeList },
        { path: 'browseList', component: BrowseList },
      ]
    },
    {
      path: '/categoryDetail/:categoryId',
      component: CategoryDetail
    },
    {
      path: '/focusAndFansList/:type/:userId',
      component: FocusAndFansList
    },

    /**
     * 个人中心
     */
    {
      path: '/personal',
      component: Personal,
      redirect: '/personal/profile',
      children: [
        { path: 'profile', component: Profile },
        { path: 'account', component: AccountSetting },
        { path: 'myLikes', component: MyLikes },
        { path: 'myCollect', component: MyCollect },
        { path: 'myBrowse', component: MyBrowse },
        { path: 'editProfile', component: EditProfile }
      ]
    },
    /**
     * 等级中心
     */
    {
      path: '/levelCenter',
      component: LevelCenterIndex
    },
    /**
     * 会员中心
     */
    {
      path: '/vipCenter',
      component: VipCenterIndex
    },
    /**
     * 消息中心
     */
    {
      path: '/messageCenter',
      component: MessageCenterIndex,
      redirect: '/messageCenter/myMessage',
      children: [
        { path: 'myMessage', component: MyMessage },
        { path: 'myComment', component: MyComment },
        { path: 'myNewFan', component: MyNewFan },
        { path: 'myLikeAndCollect', component: MyLikeAndCollect }
      ]
    },
    /**
     * 创作者中心
     */
    {
      path: '/creatorCenter',
      component: CreatorCenterIndex
    },
    /**
     * 他人用户主页
     */
    {
      path: '/otherUserHome/:userId',
      component: OtherUserHomeIndex,
      redirect: (to) => {
        return `/otherUserHome/${to.params.userId}/postList`
      },
      children: [
        { path: 'postList', component: OtherPostList },
        { path: 'categoryList', component: OtherCategoryList },
        { path: 'shareList', component: OtherShareList },
        {
          path: 'collectList',
          component: OtherCollectList,
          children: [
            {
              path: ':favoriteId',
              component: OtherCollectDetail
            }
          ],
        },
        { path: 'likeList', component: OtherLikeList },
        { path: 'browseList', component: OtherBrowseList },
      ]
    },
    {
      path: '/otherCategoryDetail/:userId/:categoryId',
      component: OtherCategoryDetail
    },
    /**
     * 推荐用户
     */
    {
      path: '/recommendUser',
      component: RecommendUser
    },
    /**
     * 文章编辑器演示DEMO
     */
    {
      path: '/edit',
      component: EditorPage
    },
    {
      path: '/publishShare',
      component: PublishShare
    },
    {
      path: '/editShare/:shareId',
      component: EditShare
    },
    {
      path: '/publishSuccess/:userId/:postId',
      component: PublishSuccess
    },

    /**
     * 预览页
     */
    {
      path: '/shareView/:shareId',
      component: ShareView
    },
    {
      path: '/postView/:authorId/:postId',
      component: ViewPage
    },

    /**
     * 编辑文章
     */
    {
      path: '/editPost/:postId',
      component: EditPostPage
    },
    /**
     * 搜索页
     */
    {
      path: '/search',
      component: SearchPage,
      name: 'search',
    },
    /**
     * 登录页
     */
    {
      path: '/login',
      component: LoginPage,
      name: 'login'
    }
  ],
})

export default router

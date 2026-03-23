/**
 * 统一返回格式
 */
export interface ApiResponse<T = any> {
    code: number;
    msg: string;
    data?: T;
}

/**
 * 用户主页顶栏+悬浮框
 */
export interface UserInfo {
    userName: string,
    image: string,
    region: string,
    joinTime: string,
    introduction: string,
    visits: number,
    postCount: number,
    fanCount: number,
    blogAge: number,
    exp: number,
    level: number,
    focusCount: number,
    isVip: number
}

export interface UserAchievement {
    likeCount: number;
    commentCount: number;
    collectCount: number;
    codeShareCount: number;
    rank: number;
    creativeProcessList: Journey[];
}

export interface Journey {
    year: number;
    postCount: number;
}

export interface UserInterest {
    id: number;
    tagName: string;
    description: string;
    createTime: string;
    updateTime: string;
}

export type UserInterests = UserInterest[];

/**
 * 用户主页文章列表返回值类型
 */
export interface UserPost {
    content: UserPostItem[];
    currentPage: number,
    pageSize: number,
    totalElements: number,
    totalPages: number,
    hasNext: boolean,
    nextCursor: string
}

/**
 * 用户主页文章项
 */
export interface UserPostItem {
    id: number,
    title: string,
    introduction: string,
    image: string,
    type: number,
    postType: number,
    createTime: string,
    updateTime: string,
    browseCount: number,
    likeCount: number,
    collectCount: number
}

/**
 * 用户分类信息
 */
export interface UserCategory {
    categoryInfoList: UserCategoryItem[];
}

/**
 * 用户分类项
 */
export interface UserCategoryItem {
    categoryId: number;
    categoryName: string;
    image: string;
    description: string;
    postCount: number;
}

/**
 * 用户动态
 */
export interface UserShare {
    content: UserShareItem[];
    currentPage: null,
    pageSize: number,
    totalElements: number,
    totalPages: number,
    hasNext: boolean,
    nextCursor: string
}

/**
 * 用户动态项
 */
export interface UserShareItem {
    id: number,
    brief: string,
    image: string,
    createTime: string,
    contentType: number,
    browseCount: number,
    likeCount: number
}

/**
 * 用户收藏夹列表
 */
export interface UserCollect {
    id: number,
    userId: number,
    favoritesName: string,
    description: string,
    createTime: string,
    updateTime: string
}

export type UserCollects = UserCollect[]

/**
 * 收藏列表
 */
export interface UserCollectDetail {
    records: UserCollectDetailItem[];
    total: number,
    size: number,
    current: number,
    pages: number
}

export interface UserCollectDetailItem {
    postId: number,
    authorId: number,
    title: string,
    image: string,
    isVip: number,
    status: number,
    createTime: string
}

/**
 * 用户点赞列表
 */
export interface UserLike {
    records: UserLikeItem[],
    total: number,
    size: number,
    current: number,
    pages: number
}

export interface UserLikeItem {
    postId: number,
    authorId: number,
    title: string,
    image: string,
    isVip: number,
    createTime: string,
    status: number
}

/**
 * 用户浏览列表
 */
export interface UserBrowse {
    records: UserBrowseItem[],
    total: number,
    size: number,
    current: number,
    pages: number
}

export interface UserBrowseItem {
    postId: number,
    authorId: number,
    title: string,
    image: string,
    isVip: number,
    createTime: string
}

/**
 * 用户个人资料
 */
export interface PersonalInfo {
    userId: number,
    userAccount: string | null,
    userName: string | null,
    sex: number | null,
    image: string | null,
    introduction: string | null,
    region: string | null,
    birthDate: string | null,
    profession: string | null,
    isVip: number,
    blogAge: number,
    tags: TagInfo[]
}

export interface TagInfo {
    tagId: number,
    tagName: string
}

/**
 * 兴趣标签
 */
export interface Tag {
    id: number,
    tagName: string,
    classId: number,
    description: string,
    createTime: string,
    updateTime: string
}

export type Tags = Tag[]

/**
 * 标签分类
 */
export interface TagClass {
    id: number,
    className: string,
    description: string
}

export type TagClasses = TagClass[]

/**
 * 账号设置
 */
export interface AccountSetting {
    id: number,
    userAccount: string,
    phone: string,
    email: string,
    password: string,
    status: number,
    lastLoginTime: string,
    permissionId: number,
    createTime: string
}

/**
 * 用户等级信息
 */
export interface UserLevelInfo {
    image: string,
    name: string,
    exp: number,
    level: number,
    nextLevelThreshold: number
}

/**
 * 等级列表
 */
export interface Level {
    id: number,
    level: number,
    levelName: string,
    expThreshold: number
}

export type Levels = Level[]

/**
 * 用户vip信息
 */
export interface VipInfo {
    userId: number,
    expiresTime: string,
    status: number,
    createTime: string
}

/**
 * 聊天信息
 */
export interface ChatPerson {
    userId: number,
    userName: string,
    userImage: string,
    lastMessage: string,
    lastMessageTime: string,
    relationship: string,
    unreadCount: number
}

export type ChatPersons = ChatPerson[]

/**
 * 聊天详情
 */
export interface ChatDetail {
    participants: ChatParticipant[],
    messages: ChatMessage[]
}

export interface ChatParticipant {
    userId: number,
    userName: string,
    userImage: string,
    self: boolean
}

export interface ChatMessage {
    messageId: number,
    senderId: number,
    sendTime: string,
    contentType: number,
    content: string
}

/**
 * 评论通知
 */
export interface CommentNotification {
    id: number,
    userId: number,
    userName: string,
    userImage: string,
    content: string,
    objectType: number,
    objectId: number,
    objectTitle: string | null,
    createTime: string,
    isRead: number
}

export type CommentNotifications = CommentNotification[];

/**
 * 新增粉丝通知
 */
export interface FanNotification {
    userId: number,
    userName: string,
    userImage: string,
    createTime: string,
    content: string,
    isRead: number
}

export type FanNotifications = FanNotification[];

/**
 * 点赞和收藏通知
 */
export interface LikeAndCollectNotification {
    userId: number,
    userName: string,
    userImage: string,
    content: string,
    objectType: number,
    objectId: number,
    objectTitle: string | null,
    createTime: string,
    isRead: number,
    relationship: string
}

export type LikeAndCollectNotifications = LikeAndCollectNotification[];

/**
 * 分类详情
 */
export interface CategoryDetail {
    category: UserCategoryItem | null,
    posts: CategoryPost
}

export interface CategoryPost {
    records: UserPostItem[],
    total: number,
    size: number,
    current: number,
    pages: number
}

/**
 * 主页文章列表
 */
export interface IndexPost {
    id: number,
    userId: number,
    userName: string,
    avatar: string,
    title: string,
    introduction: string,
    image: string,
    type: number,
    postType: number,
    createTime: string,
    updateTime: string | null,
    browseCount: number,
    likeCount: number,
    collectCount: number
}

export type IndexPostList = IndexPost[]

/**
 * 推荐用户
 */
export interface RecommendUser {
    userId: number,
    userName: string,
    avatar: string,
    exp: number,
    level: number,
    isVip: number,
    score: number,
    postCount: number,
    fanCount: number,
    rankNum: number
}

export type RecommendUsers = RecommendUser[]

/**
 * 首页动态
 */
export interface IndexShare {
    id: number,
    userId: number,
    userName: string,
    userAvatar: string,
    topicId: number,
    createTime: string,
    brief: string,
    image: string,
    browseCount: number,
    likeCount: number
}

export type IndexShares = IndexShare[]

/**
 * 首页话题
 */
export interface IndexTopic {
    id: number,
    topicName: string,
}

export type IndexTopics = IndexTopic[]

/**
 * 关注作品
 */
export interface FollowContent {
    articleId: number,
    userId: number,
    userName: string,
    avatar: string,
    title: string,
    intro: string,
    cover: string,
    createTime: string,
    type: number,
    postType: number
}

export type FollowContents = FollowContent[]

/**
 * 关注/粉丝信息
 */
export interface FocusAndFansInfo {
    userId: number,
    userName: string,
    avatar: string,
    introduction: string | null,
    createTime: string,
    followStatus: number | null,
    listType: number | null
}

export type FocusAndFansInfos = FocusAndFansInfo[];

/**
 * 发布动态页话题
 */
export interface PublishTopic {
    id: number,
    topicName: string,
    cover: string,
    description: string,
    participateCount: number
}

export type PublishTopics = PublishTopic[]

/**
 * 动态预览页
 */
export interface ShareView {
    id: number,
    authorId: number,
    userName: string,
    userImage: string,
    content: string,
    topicId: number,
    createTime: string,
    imageUrl: string | null,
    videoUrl: string | null,
    browseCount: number,
    likeCount: number,
    commentCount: number,
    like: boolean
}

/**
 * 评论列表
 */
export interface CommentItem {
    commentId: number,
    userId: number,
    userName: string,
    userAvatar: string,
    content: string | null,
    createTime: string,
    childCount: number,
    likeCount: number,
    isLike: boolean,
    level: number,
    parentUserName: string,
    parentCommentId: number,
    children: CommentItem[] | null

    isExpanded: boolean
}

export type CommentItems = CommentItem[]

/**
 * 文章预览页
 */
export interface PostView {
    postId: number,
    authorId: number,
    title: string,
    createTime: string,
    storeType: number,
    content: string,
    browseCount: number,
    likeCount: number,
    collectCount: number,
    commentCount: number,
    tagList: {
        tagId: number,
        tagName: string
    }[],
    status: number,
    type: number,
    postType: number,
    isVip: number,
    categoryId: number,
    categoryName: string,
    categoryCover: string,
    liked: number,
    collected: number
}

/**
 * 文章浏览量top10
 */
export interface BrowseTopPost {
    id: number,
    authorId: number,
    title: string,
    introduction: string,
    image: string,
    status: number,
    contentId: number,
    type: number,
    postType: number,
    isVip: number,
    categoryId: number,
    createTime: string,
    updateTime: string | null,
    browseCount: number
}

export type BrowseTopPosts = BrowseTopPost[]

/**
 * 草稿箱
 */
export interface DraftItem {
    id: number,
    title: string,
    lastUpdateTime: string
}

export type DraftItems = DraftItem[]

/**
 * 搜索结果
 */
export interface SearchResult {
    id: number,
    authorId: number,
    exp: number,
    authorLevel: number,
    authorName: string,
    title: string,
    introduction: string,
    content: string | null,
    categoryId: number,
    status: number,
    type: number,
    postType: number,
    isVip: number,
    createTime: string,
    updateTime: string | null,
    viewCount: number,
    likeCount: number,
    commentCount: number,
    collectCount: number
}

export interface SearchResultList {
    content: SearchResult[],
    currentPage: number,
    pageSize: number,
    totalElements: number,
    totalPages: number,
    hasNext: boolean,
    nextCursor: string
}

/**
 * 搜索记录 
 */
export interface SearchHistory {
    id: number,
    userId: number,
    keyword: string,
    searchType: string,
    createTime: string
}

export type SearchHistories = SearchHistory[]

/**
 * 搜索用户
 */
export interface SearchUser {
    userId: number,
    userName: string,
    image: string,
    introduction: string,
    contentCount: number,
    viewCount: number,
    likedCount: number,
    follow: number
}

export type SearchUsers = SearchUser[]

/**
 * 热搜
 */
export interface HotSearch {
    keyword: string,
    count: number
}

export type HotSearches = HotSearch[]

/**
 * AI会话列表
 */
export interface AIChatList {
    conversationId: string,
    title: string,
    createTime: string
}

export type AIChatLists = AIChatList[]

/**
 * AI对话详情
 */
export interface AIChatDetail {
    conversationId: string,
    content: string,
    type: string,
    timestamp: string,
    file: string
}

export type AIChatDetails = AIChatDetail[]

/**
 * 趋势
 */
export interface Trend {
    type: string,
    contentTrends: TrendData[]
}

/**
 * 粉丝、互动趋势
 */
export interface TrendData {
    date: string,
    count: number
}

/**
 * 内容列表
 */
export interface CreatorContentItem {
    id: number,
    userId: null,
    userName: null,
    avatar: null,
    title: string,
    introduction: string,
    image: string,
    type: number,
    postType: number,
    createTime: string,
    updateTime: string | null,
    browseCount: number,
    likeCount: number,
    collectCount: number,
    interestScore: null,
    commentCount: number
}

export interface CreatorContentList {
    records: CreatorContentItem[],
    total: number,
    size: number,
    current: number,
    pages: number
}

/**
 * 工单列表
 */
export interface WorkOrder {
    id: number,
    orderId: string,
    userId: number,
    userName: string,
    targetId: number,
    targetType: number,
    orderType: number,
    reason: string,
    filePath: string,
    status: number,
    createTime: string,
    updateTime: string,
    handleReason: string
}

export interface WorkOrderList {
    records: WorkOrder[],
    total: number,
    size: number,
    current: number,
    pages: number
}

/**
 * 网站组件定义
 */
export interface WebsiteComponentDefine {
    id: number,
    contentType: string,
    contentKey: string,
    contentValue: string,
    contentFormat: string,
    category: string,
    groupName: string,
    title: string,
    description: string,
    sortOrder: number,
    attributes: string,
    attributesMap: any,
    status: number,
    isPublic: number,
    createdBy: string,
    updatedBy: string,
    createTime: string,
    updateTime: string
}

export interface IPostAuthor {
  handle: string;
  displayName?: string;
  avatar?: string;
}

export interface IPostImage {
  thumb: string;
  fullsize: string;
  alt: string;
}

export interface IPost {
  account: string;
  postId: string;
  url: string;
  author: IPostAuthor;
  text: string;
  createdAt: Date;
  images: IPostImage[];
  likeCount: number;
  repostCount: number;
  replyCount: number;
  quoteCount: number;
}

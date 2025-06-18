export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
  comments?: Comment[];
}


export interface PostWithImage extends Post {
  imageUrl: string;
}

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

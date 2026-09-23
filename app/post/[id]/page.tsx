import PostDetail from "@/components/post-detail";
export default async function Page({params}:{params:Promise<{id:string}>}){return <PostDetail id={(await params).id}/>}

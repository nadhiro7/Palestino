import ThreadCard from "@/components/cards/ThreadCard"
import CommentForm from "@/components/forms/CommentForm";
import { fetchThreadById } from "@/lib/actions/thread.action";
import { fetchUser } from "@/lib/actions/user.action";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

async function page({ params }: { params: { id: string } }) {
    if (!params.id) return null;

    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo.onboarded) return redirect('/onboarding');

    const thread = await fetchThreadById(params.id)

    return (
        <section className="relative">
            <div>
                <ThreadCard
                    key={thread._id}
                    id={thread._id}
                    currentUserId={user?.id || ''}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={thread.author}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                />
            </div>
            <div className="mt-7 ">
                <CommentForm
                    threadId={thread._id}
                    currentUserImage={userInfo.image}
                    currentUserId={userInfo._id}
                />
            </div>
            <div className="mt-10">
                {thread.children.map((child: any) => (
                    <ThreadCard
                        key={child._id}
                        id={child._id}
                        currentUserId={user?.id || ''}
                        parentId={child.parentId}
                        content={child.text}
                        author={child.author}
                        community={child.community}
                        createdAt={child.createdAt}
                        comments={child.children}
                        isComment
                    />
                ))}
            </div>
        </section>
    )
}

export default page

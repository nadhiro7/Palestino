import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.action";
import { UserButton, currentUser } from "@clerk/nextjs";

export default async function Home() {
  const result = await fetchThreads(1, 30)
  const user = await currentUser()
  return (
    <>
      <section className="mt-9 flex flex-col gap-10">
        {result.threads.length === 0 ? (
          <p>no threads to show</p>
        ) : (
          <>
            {
              result.threads.map(thread => (
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
              ))
            }
          </>
        )}
      </section>
    </>
  )
}
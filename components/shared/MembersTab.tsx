import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.action";
import { fetchUserPosts } from "@/lib/actions/user.action";

import ThreadCard from "../cards/ThreadCard";
import UserCard from "../cards/UserCard";


interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

async function MembersTab({ currentUserId, accountId, accountType }: Props) {


    // if (!result) {
    //     redirect("/");
    // }

    return (
        <section className='mt-9 flex flex-col gap-10'>
            {/* {result.users.map((person) => (
                <UserCard
                    key={person.id}
                    id={person.id}
                    name={person.name}
                    username={person.username}
                    image={person.image}
                    personType='User'
                />
            ))} */}
        </section>
    );
}

export default MembersTab;

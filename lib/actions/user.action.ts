"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { ConnectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";
interface Params {
    userId: string;
    name: string;
    username: string;
    bio: string;
    image: string;
    path: string;
}
export async function updateUser({
    userId,
    name,
    username,
    bio,
    image,
    path,
}: Params): Promise<void> {


    try {
        ConnectToDB();
        await User.findOneAndUpdate(
            { id: userId },
            {
                name,
                username: username.toLowerCase(),
                image,
                bio,
                onboarded: true,
            },
            { upsert: true }
        );
        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error) {
        throw new Error(`Failed to create/update user ${error}`);
    }
}
export async function fetchUser(userId: string) {
    try {
        ConnectToDB();
        return await User.findOne(
            { id: userId }
        )
        //.populate({
        //     path: 'communities',
        //     model: 'community'
        // })
    } catch (error) {
        throw new Error(`Failed to fetch user ${error}`);
    }
}

export async function fetchUserThreads(userId: string) {
    try {
        ConnectToDB();
        const threads = User.findOne(
            { id: userId }
        )
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'id name image'
                    }
                }
            })
        return threads;
    } catch (error) {
        throw new Error(`Failed to fetch threads ${error}`);
    }
}

export async function fetchUsers({ userId, searchString = '', pageNumber = 1, pageSize = 20, sortBy = 'desc' }
    : {
        userId: string,
        searchString?: string,
        pageNumber?: number,
        pageSize?: number,
        sortBy?: SortOrder
    }
) {
    try {
        ConnectToDB()
        const skipAmount = (pageNumber - 1) * pageSize;

        const regex = new RegExp(searchString, 'i')
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        }
        if (searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }
        const sortOption = { createdAt: sortBy }

        const userQuery = User.find(query)
            .sort(sortOption)
            .skip(skipAmount)
            .limit(pageSize)
        const totalUsersCount = await User.countDocuments();
        const users = await userQuery.exec()
        const isNext = totalUsersCount > skipAmount + users.length

        return { users, isNext }
    } catch (error: any) {
        throw new Error('failed to search users ' + error.message)
    }
}

export async function getActivity(userId: string) {
    try {
        ConnectToDB();

        const userThreads = await Thread.find({ author: userId })

        const childrenThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
        }, [])

        const replies = await Thread.find({
            _id: { $in: childrenThreadIds },
            author: { $ne: userId }
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies
    } catch (error: any) {
        throw new Error(`Failed to get activities ${error.message}`);
    }
}
export async function fetchUserPosts(userId: string) {
    try {
        ConnectToDB();

        // Find all threads authored by the user with the given userId
        const threads = await User.findOne({ id: userId }).populate({
            path: "threads",
            model: Thread,
            populate: [
                {
                    path: "community",
                    model: Community,
                    select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "name image id", // Select the "name" and "_id" fields from the "User" model
                    },
                },
            ],
        });
        return threads;
    } catch (error) {
        console.error("Error fetching user threads:", error);
        throw error;
    }
}
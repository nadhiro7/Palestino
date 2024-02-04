'use server'


import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model"
import User from "../models/user.model";
import { ConnectToDB } from "../mongoose"
import Community from "../models/community.model";
import mongoose from "mongoose";

interface Params {
    text: string,
    author: string,
    community: string | null,
    pathname: string
}

export async function createThread({
    text, author, community, pathname
}: Params) {
    try {
        ConnectToDB();
        const newThread = await Thread.create({ text, author, community: community })

        await User.findByIdAndUpdate(author, { $push: { threads: newThread._id } })
        revalidatePath(pathname)
    } catch (error: any) {
        throw new Error(`Error Creating Thread ${error.message}`)
    }
}


export async function fetchThreads(pageNumber = 1, pageSize = 20) {
    try {
        ConnectToDB()

        const skipAmount = (pageNumber - 1) * pageSize;

        const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .populate({ path: 'author', model: User })
            .populate({
                path: 'children',
                populate: {
                    path: 'author',
                    model: User,
                    select: '_id name image parentID'
                }
            })
        const TotalThreadsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } })
        const threads = await threadsQuery.exec();
        const isNext = TotalThreadsCount > skipAmount + threads.length;
        return { threads, isNext }
    } catch (error: any) {
        throw new Error(`Error fetching Threads ${error.message}`)
    }
}

export async function fetchThreadById(threadId: string) {
    try {
        ConnectToDB();
        const thread = await Thread.findById(threadId)
            .populate({ path: 'author', model: User, select: '_id name image parentID' })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: '_id name image parentID'
                    }, {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: '_id name image parentID'
                        }
                    }
                ]
            }).exec()
        return thread;
    } catch (error: any) {
        throw new Error(`Error fetching Thread ${error.message}`)
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    author: string,
    path: string
) {
    ConnectToDB();

    try {
        // Find the original thread by its ID
        const originalThread = await Thread.findById(threadId);
        if (!originalThread) {
            throw new Error("Thread not found");
        }

        // Create the new comment thread
        const commentThread = new Thread({
            text: commentText,
            author,
            parentId: threadId, // Set the parentId to the original thread's ID
        });

        // Save the comment thread to the database
        const savedCommentThread = await commentThread.save();

        // Add the comment thread's ID to the original thread's children array
        originalThread.children.push(savedCommentThread._id);

        // Save the updated original thread to the database
        await originalThread.save();

        revalidatePath(path);
    } catch (err) {
        console.error("Error while adding comment:", err);
        throw new Error("Unable to add comment");
    }
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        ConnectToDB();

        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate("author community");

        if (!mainThread) {
            throw new Error("Thread not found");
        }

        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread._id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to delete thread: ${error.message}`);
    }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
    const childThreads = await Thread.find({ parentId: threadId });

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread._id);
        descendantThreads.push(childThread, ...descendants);
    }

    return descendantThreads;
}

export interface Task{
    id: string;
    user_email: string;
    title: string;
    date: string;
    starred_status: boolean;
    completion_status: boolean;
    archived_status: boolean;
}

export enum TaskStatus {
    ALL = "all",
    ACTIVE = "active",
    COMPLETED = "completed",
    ARCHIVED = "archived",
    STARRED = "starred",
}

export type CreateTaskData = {
    title: string;
    date: string;
    completionStatus: boolean;
    starredStatus: boolean;
};

export type UpdateTaskData = {
    title?: string;
};

export interface Task{
    id: string;
    user_email: string;
    title: string;
    date: string;
    starred_status: boolean;
    completion_status: boolean;
    archived_status: boolean;
    due_date?: Date | null;
}

export enum TaskStatus {
    ALL = "all",
    ACTIVE = "active",
    COMPLETED = "completed",
    ARCHIVED = "archived",
    STARRED = "starred",
    OVERDUE = "overdue",
}

export type CreateTaskData = {
    title: string;
    date: string;
    completionStatus: boolean;
    starredStatus: boolean;
    dueDate?: Date | null;
};

export type UpdateTaskData = {
    title?: string;
    dueDate?: Date | null;
};


import { CreateTaskData } from "@/constants/types";
import api from "./api";
import { getEmail } from "./authService";

// Helper to prevent UTC conversion from shifting the day backwards
const formatLocalDateForServer = (date: Date) => {
    // Extract local year, month, and day components and format as YYYY-MM-DD
    const localYea = date.getFullYear();
    const localMonth = String(date.getMonth() + 1).padStart(2, '0');
    const localDay = String(date.getDate()).padStart(2, '0');
    return `${localYea}-${localMonth}-${localDay}`;
};

export const getTasks = async () => {
    const email = await getEmail();
    try {
        const response = await api.get(`/tasks/${email}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        throw error;
    }
}

export const createTask = async (data: CreateTaskData) => {
    const email = await getEmail();
    const { title, date, completionStatus, starredStatus, dueDate } = data;
    
    try {
        const payload: any = { title, date, user_email: email, completionStatus, starredStatus };
        if (dueDate) {
            payload.due_date = formatLocalDateForServer(dueDate);
        }
        const response = await api.post('/tasks', payload);
        return response.data;
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
}

export const updateTask = async (taskId: string, newTitle: string, dueDate?: Date | null) => {
    const email = await getEmail();
    try {
        const payload: any = { title: newTitle, user_email: email };
        if (dueDate !== undefined) {
            payload.due_date = dueDate ? formatLocalDateForServer(dueDate) : null;
        }
        const response = await api.put(`/tasks/${taskId}`, payload);
        return response.data;
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
}

export const deleteTask = async (id: string) => {
    try {
        const response = await api.delete(`/tasks/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
}

export const toggleTaskCompletion = async (id: string, completionStatus: boolean) => {
    const email = await getEmail();
    try {
        const response = await api.put(`/tasks/${id}/complete`, { user_email: email, isCompleted: completionStatus });
        return response.data;
    } catch (error) {
        console.error("Error toggling task completion:", error);
        throw error;
    }
}

export const toggleTaskStar = async (id: string, starredStatus: boolean) => {
    const email = await getEmail();
    try {
        const response = await api.put(`/tasks/${id}/star`, { user_email: email, isStarred: starredStatus });
        return response.data;
    } catch (error) {
        console.error("Error toggling task star:", error);
        throw error;
    }
}

export const toggleArchiveTask = async (id: string, archivedStatus: boolean) => {
    const email = await getEmail();
    try {
        const response = await api.put(`/tasks/${id}/archive`, { user_email: email, isArchived: archivedStatus });
        return response.data;
    } catch (error) {
        console.error("Error toggling task archive:", error);
        throw error;
    }
}
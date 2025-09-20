

import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import * as SecureStore from "expo-secure-store";
import { getEmail } from "./authService"
import { CreateTaskData } from "@/constants/types";

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
    const { title, date, completionStatus, starredStatus } = data;
    
    try {
        const response = await api.post('/tasks', { title, date, user_email: email, completionStatus, starredStatus });
        return response.data;
    } catch (error) {
        console.error("Error creating task:", error);
        throw error;
    }
}

export const updateTask = async (taskId: string, newTitle: string) => {
    const email = await getEmail();
    try {
        const response = await api.put(`/tasks/${taskId}`, { title: newTitle, user_email: email });
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
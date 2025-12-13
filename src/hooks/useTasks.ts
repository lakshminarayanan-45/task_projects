import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string | null;
  creator_id: string | null;
  created_at: string;
  updated_at: string;
  assignee?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  } | null;
  creator?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  } | null;
}

export interface Comment {
  id: string;
  task_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    name: string | null;
    email: string | null;
    avatar: string | null;
  } | null;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, email, avatar),
        creator:profiles!tasks_creator_id_fkey(id, name, email, avatar)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    } else {
      setTasks(data as Task[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (task: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    due_date?: string;
    assignee_id?: string;
  }) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...task,
        creator_id: user.id,
      })
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, email, avatar),
        creator:profiles!tasks_creator_id_fkey(id, name, email, avatar)
      `)
      .single();

    if (error) {
      console.error("Error adding task:", error);
      toast.error("Failed to create task");
      return null;
    }

    setTasks((prev) => [data as Task, ...prev]);
    toast.success("Task created successfully");
    return data as Task;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, email, avatar),
        creator:profiles!tasks_creator_id_fkey(id, name, email, avatar)
      `)
      .single();

    if (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
      return null;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? (data as Task) : t))
    );
    toast.success("Task updated successfully");
    return data as Task;
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
      return false;
    }

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast.success("Task deleted successfully");
    return true;
  };

  return {
    tasks,
    loading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  };
}

export function useComments(taskId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!taskId) return;

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, name, email, avatar)
      `)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else {
      setComments(data as Comment[]);
    }
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user || !taskId) return null;

    const { data, error } = await supabase
      .from("comments")
      .insert({
        task_id: taskId,
        author_id: user.id,
        content,
      })
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, name, email, avatar)
      `)
      .single();

    if (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return null;
    }

    setComments((prev) => [...prev, data as Comment]);
    return data as Comment;
  };

  const updateComment = async (commentId: string, content: string) => {
    const { data, error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, name, email, avatar)
      `)
      .single();

    if (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
      return null;
    }

    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? (data as Comment) : c))
    );
    return data as Comment;
  };

  const deleteComment = async (commentId: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", commentId);

    if (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      return false;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    return true;
  };

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
}
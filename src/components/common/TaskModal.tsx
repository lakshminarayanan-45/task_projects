import React, { useState, useEffect } from "react";
import { X, Calendar, User, Flag, MessageSquare, Edit2, Trash2, Check, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Task, useComments } from "@/hooks/useTasks";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/context/AuthContext";

const priorityOptions = ["high", "medium", "low"];
const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "done", label: "Completed" },
];

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<any>;
  onDeleteTask: (taskId: string) => Promise<boolean>;
}

export default function TaskModal({ task, isOpen, onClose, onUpdateTask, onDeleteTask }: TaskModalProps) {
  const { profile } = useAuth();
  const { profiles } = useProfiles();
  const { comments, addComment, updateComment } = useComments(task?.id || "");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  useEffect(() => {
    if (task) {
      setEditedTask({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee_id: task.assignee_id,
        due_date: task.due_date,
      });
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = async () => {
    await onUpdateTask(task.id, editedTask);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const success = await onDeleteTask(task.id);
      if (success) {
        onClose();
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment(newComment);
    setNewComment("");
  };

  const handleSaveComment = async (commentId: string) => {
    if (!editedCommentText.trim()) return;
    await updateComment(commentId, editedCommentText);
    setEditingCommentId(null);
    setEditedCommentText("");
  };

  const canEdit = profile?.role === "admin" || profile?.role === "manager";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Edit Task" : "Task Details"}
          </h2>
          <div className="flex items-center gap-2">
            {!isEditing && canEdit && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-4 space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Title</label>
                <input
                  type="text"
                  value={editedTask.title || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={editedTask.description || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                  <select
                    value={editedTask.status || "todo"}
                    onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                    className="input-field"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Priority</label>
                  <select
                    value={editedTask.priority || "medium"}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                    className="input-field"
                  >
                    {priorityOptions.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Assignee</label>
                  <select
                    value={editedTask.assignee_id || ""}
                    onChange={(e) => setEditedTask({ ...editedTask, assignee_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Unassigned</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.name || p.email}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={editedTask.due_date || ""}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSave} className="btn-primary">
                  Save Changes
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{task.title}</h3>
                {task.description && (
                  <p className="text-muted-foreground">{task.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Flag className="w-4 h-4" />
                    Priority
                  </div>
                  <span className="font-medium text-foreground capitalize">{task.priority}</span>
                </div>

                <div className="p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    Due Date
                  </div>
                  <span className="font-medium text-foreground">
                    {task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "No date set"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <User className="w-4 h-4" />
                    Assignee
                  </div>
                  <span className="font-medium text-foreground">
                    {task.assignee?.name || task.assignee?.email || "Unassigned"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <User className="w-4 h-4" />
                    Created By
                  </div>
                  <span className="font-medium text-foreground">
                    {task.creator?.name || task.creator?.email || "Unknown"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <MessageSquare className="w-4 h-4" />
                  Comments ({comments.length})
                </h4>

                <div className="space-y-3 mb-4">
                  {comments.map((comment) => {
                    const isOwn = comment.author_id === profile?.id;
                    const isEditingThis = editingCommentId === comment.id;

                    return (
                      <div key={comment.id} className="p-3 rounded-lg bg-accent/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs text-primary-foreground font-medium">
                              {(comment.author?.name || comment.author?.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {comment.author?.name || comment.author?.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                          
                          {isOwn && !isEditingThis && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditedCommentText(comment.content);
                              }}
                              className="p-1 rounded hover:bg-accent transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-muted-foreground" />
                            </button>
                          )}
                        </div>

                        {isEditingThis ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editedCommentText}
                              onChange={(e) => setEditedCommentText(e.target.value)}
                              className="flex-1 input-field text-sm py-1.5"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveComment(comment.id)}
                              className="p-1.5 rounded-lg bg-primary text-primary-foreground"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="p-1.5 rounded-lg bg-muted"
                            >
                              <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 input-field"
                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="btn-primary px-3"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
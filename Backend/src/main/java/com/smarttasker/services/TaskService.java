package com.smarttasker.services;

import com.smarttasker.models.Task;
import com.smarttasker.models.TaskStatus;
import com.smarttasker.models.User;
import com.smarttasker.repositories.TaskRepository;
import com.smarttasker.repositories.UserRepository;
import com.smarttasker.exceptions.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public Task createTask(Long userId, Task task) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        task.setUser(user);
        Task savedTask = taskRepository.save(task);

        // Create notification for new task assigned
        notificationService.createNotification(user, "New task assigned: " + task.getTitle());

        return savedTask;
    }

    @Transactional
    public Task updateTask(Long taskId, Task updatedTask) {
        Task existing = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        existing.setTitle(updatedTask.getTitle());
        existing.setDescription(updatedTask.getDescription());
        existing.setDueDate(updatedTask.getDueDate()); 
   	  existing.setStatus(updatedTask.getStatus());

        Task savedTask = taskRepository.save(existing);

        // Create notification for task updated
        notificationService.createNotification(savedTask.getUser(), "Task updated: " + savedTask.getTitle());

        return savedTask;
    }

    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Task not found");
        }
        taskRepository.deleteById(taskId);
    }

    @Transactional
    public int updateTaskStatus(Long taskId, TaskStatus newStatus) {
        LocalDateTime now = LocalDateTime.now();
        int updatedRows = taskRepository.updateTaskStatusById(taskId, newStatus, now);

        if (updatedRows > 0) {
            Task updatedTask = taskRepository.findById(taskId).orElse(null);
            if (updatedTask != null) {
                notificationService.createNotification(updatedTask.getUser(), "Task status changed to " + newStatus.name() + ": " + updatedTask.getTitle());
            }
        }
        return updatedRows;
    }

    @Cacheable(value = "tasks", key = "#userId")
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    public List<Task> getUpcomingTasks(Long userId) {
        return taskRepository.findByUserIdAndDueDateAfter(userId, LocalDateTime.now());
    }

    public Task getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    public List<Task> getTasksByUserId(Long userId) {
        return taskRepository.findByUserId(userId);
    }

    // Get tasks sorted by nearest deadline
    public List<Task> getTasksSortedByDeadline(Long userId) {
        List<Task> tasks = getTasksByUserId(userId);
        return tasks.stream()
                .sorted(Comparator.comparing(Task::getDueDate))
                .toList();
    }

    // Detect conflicts: overlapping tasks due at same hour

    public List<Task> detectTaskConflicts(Long userId) {
        List<Task> activeTasks = getTasksByUserId(userId).stream()
                .filter(task -> !task.getStatus().equals(TaskStatus.COMPLETED))
                .sorted(Comparator.comparing(Task::getDueDate))
                .collect(Collectors.toList());

        List<Task> conflicts = new ArrayList<>();
        for (int i = 1; i < activeTasks.size(); i++) { 
            LocalDateTime prev = activeTasks.get(i - 1).getDueDate();
            LocalDateTime curr = activeTasks.get(i).getDueDate();
            if (Math.abs(prev.until(curr, ChronoUnit.MINUTES)) <= 60) {
                // Add only active tasks to the conflicts list
                conflicts.add(activeTasks.get(i - 1));
                conflicts.add(activeTasks.get(i));
            }
        }
        return conflicts;
    }

    
    @Transactional
    public List<Task> markOverdueTasks(Long userId) {
        LocalDateTime now = LocalDateTime.now();

        List<Task> eligibleTasks = taskRepository.findPendingAndOverdueTasksByUserId(userId, now);

        List<Task> tasksActuallyMarkedOverdue = new ArrayList<>();

        for (Task task : eligibleTasks) {
            int updatedRows = taskRepository.markTaskOverdueById(
                    task.getId(), now
            );

            if (updatedRows > 0) {
                
                Task updatedAndFreshTask = taskRepository.findById(task.getId())
                        .orElse(null); 

                if (updatedAndFreshTask != null) {
                    tasksActuallyMarkedOverdue.add(updatedAndFreshTask);
                    notificationService.createNotification(updatedAndFreshTask.getUser(), "Task overdue: " + updatedAndFreshTask.getTitle());
                } else {
                    System.err.println("Could not re-fetch task " + task.getId() + " after update.");
                }
            }
        }

        return tasksActuallyMarkedOverdue;
    }

}

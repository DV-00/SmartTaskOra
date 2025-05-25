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

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    // Inject NotificationService without modifying existing code lines
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
        List<Task> tasks = getTasksByUserId(userId).stream()
                .sorted(Comparator.comparing(Task::getDueDate))
                .toList();

        List<Task> conflicts = new ArrayList<>();
        for (int i = 1; i < tasks.size(); i++) {
            LocalDateTime prev = tasks.get(i - 1).getDueDate();
            LocalDateTime curr = tasks.get(i).getDueDate();
            if (Math.abs(prev.until(curr, ChronoUnit.MINUTES)) <= 60) {
                conflicts.add(tasks.get(i - 1));
                conflicts.add(tasks.get(i));
            }
        }
        return conflicts;
    }

    // Mark overdue tasks
    public List<Task> markOverdueTasks(Long userId) {
        List<Task> tasks = getTasksByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        for (Task task : tasks) {
            if (task.getDueDate().isBefore(now) && !task.getStatus().equals(TaskStatus.COMPLETED)) {
                task.setStatus(TaskStatus.OVERDUE);
                taskRepository.save(task);

                // Create notification for overdue task
                notificationService.createNotification(task.getUser(), "Task overdue: " + task.getTitle());
            }
        }
        return tasks;
    }

}

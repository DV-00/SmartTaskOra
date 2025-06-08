package com.smarttasker.controllers;

import com.smarttasker.dto.TaskDTO;
import com.smarttasker.models.Task;
import com.smarttasker.services.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Validated
public class TaskController {

    private final TaskService taskService;
    private final ModelMapper modelMapper;

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/user/{userId}")
    public ResponseEntity<TaskDTO> createTask(@PathVariable Long userId, @Valid @RequestBody TaskDTO taskDTO) {
        if (taskDTO.getDueDate() == null) {
            return ResponseEntity.badRequest().build();
        }

        Task taskRequest = modelMapper.map(taskDTO, Task.class);
        Task createdTask = taskService.createTask(userId, taskRequest);
        TaskDTO responseDTO = modelMapper.map(createdTask, TaskDTO.class);
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        TaskDTO taskDTO = modelMapper.map(task, TaskDTO.class);
        return ResponseEntity.ok(taskDTO);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDTO>> getTasksByUser(@PathVariable Long userId) {
        List<Task> tasks = taskService.getTasksByUserId(userId);
        List<TaskDTO> taskDTOs = tasks.stream()
                .map(task -> modelMapper.map(task, TaskDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDTO taskDTO) {
        if (taskDTO.getDueDate() == null) {
            return ResponseEntity.badRequest().build();
        }

        Task taskDetails = modelMapper.map(taskDTO, Task.class);
        Task updatedTask = taskService.updateTask(id, taskDetails);
        TaskDTO responseDTO = modelMapper.map(updatedTask, TaskDTO.class);
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/user/{userId}/sorted-by-deadline")
    public ResponseEntity<List<TaskDTO>> getTasksSortedByDeadline(@PathVariable Long userId) {
        List<Task> sortedTasks = taskService.getTasksSortedByDeadline(userId);
        List<TaskDTO> dtoList = sortedTasks.stream()
                .map(task -> modelMapper.map(task, TaskDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/user/{userId}/conflicts")
    public ResponseEntity<List<TaskDTO>> detectConflicts(@PathVariable Long userId) {
        List<Task> conflicts = taskService.detectTaskConflicts(userId);
        List<TaskDTO> dtoList = conflicts.stream()
                .map(task -> modelMapper.map(task, TaskDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/user/{userId}/mark-overdue")
    public ResponseEntity<List<TaskDTO>> markOverdueTasks(@PathVariable Long userId) {
        List<Task> updatedTasks = taskService.markOverdueTasks(userId);
        List<TaskDTO> dtoList = updatedTasks.stream()
                .map(task -> modelMapper.map(task, TaskDTO.class))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

}

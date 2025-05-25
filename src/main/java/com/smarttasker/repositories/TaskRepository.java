package com.smarttasker.repositories;

import com.smarttasker.models.Task;
import com.smarttasker.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndDueDateAfter(Long userId, LocalDateTime dateTime);
}

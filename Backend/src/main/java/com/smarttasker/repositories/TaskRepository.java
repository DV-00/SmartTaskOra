package com.smarttasker.repositories;

import com.smarttasker.models.Task;
import com.smarttasker.models.TaskStatus; 
import com.smarttasker.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; 
import org.springframework.data.jpa.repository.Query;  
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional; 

import java.time.LocalDateTime;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserId(Long userId);
    List<Task> findByUserIdAndDueDateAfter(Long userId, LocalDateTime dateTime);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
            "AND t.status = 'PENDING' " +
            "AND t.dueDate < :currentTime")
    List<Task> findPendingAndOverdueTasksByUserId(
            @Param("userId") Long userId,
            @Param("currentTime") LocalDateTime currentTime
    );

    /
    @Modifying 
    @Transactional 
    @Query("UPDATE Task t SET t.status = 'OVERDUE' " + 
            "WHERE t.id = :taskId " +
            "AND t.status = 'PENDING' " +
            "AND t.dueDate < :currentTime")
    int markTaskOverdueById(
            @Param("taskId") Long taskId,
            @Param("currentTime") LocalDateTime currentTime
    );

    
    @Modifying
    @Query("UPDATE Task t SET t.status = :newStatus, t.updatedAt = :now WHERE t.id = :taskId")
    int updateTaskStatusById(@Param("taskId") Long taskId, @Param("newStatus") TaskStatus newStatus, @Param("now") LocalDateTime now);

}
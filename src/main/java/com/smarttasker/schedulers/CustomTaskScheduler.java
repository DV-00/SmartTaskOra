package com.smarttasker.schedulers;

import com.smarttasker.services.TaskService;
import com.smarttasker.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CustomTaskScheduler {

    private final TaskService taskService;
    private final UserService userService;

    // ⏰ Run every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    public void autoMarkOverdueTasks() {
        userService.getAllUserIds().forEach(userId -> {
            try {
                taskService.markOverdueTasks(userId);
                log.info("Marked overdue tasks for userId: {}", userId);
            } catch (Exception e) {
                log.error("Error marking overdue tasks for userId: " + userId, e);
            }
        });
    }
}

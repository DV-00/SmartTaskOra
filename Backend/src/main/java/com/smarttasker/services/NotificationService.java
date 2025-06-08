package com.smarttasker.services;

import com.smarttasker.exceptions.ResourceNotFoundException;
import com.smarttasker.models.Notification;
import com.smarttasker.models.User;
import com.smarttasker.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalse(user);
    }

    public Notification markAsRead(Long notificationId, User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Access denied: Notification doesn't belong to user");
        }

        notification.setRead(true);
        Notification saved = notificationRepository.save(notification);

        System.out.println("📧 Email Sent: Notification marked as read for user " + currentUser.getUsername());

        return saved;
    }

    public Notification createNotification(User user, String message) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

}

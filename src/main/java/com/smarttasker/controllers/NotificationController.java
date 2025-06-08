package com.smarttasker.controllers;

import com.smarttasker.dto.NotificationDTO;
import com.smarttasker.models.Notification;
import com.smarttasker.models.User;
import com.smarttasker.repositories.UserRepository;
import com.smarttasker.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Notification> notifications = notificationService.getUnreadNotifications(user);

        List<NotificationDTO> dtos = notifications.stream()
                .map(n -> {
                    NotificationDTO dto = modelMapper.map(n, NotificationDTO.class);
                    dto.setUserId(user.getId());
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markNotificationAsRead(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Notification updated = notificationService.markAsRead(id, user);

        NotificationDTO dto = modelMapper.map(updated, NotificationDTO.class);
        dto.setUserId(user.getId());
        return ResponseEntity.ok(dto);
    }

    private User getAuthenticatedUser(Authentication auth) {
        String username = auth.getName(); // this is username, not email
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

}

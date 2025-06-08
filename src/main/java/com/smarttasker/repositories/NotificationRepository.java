package com.smarttasker.repositories;

import com.smarttasker.models.Notification;
import com.smarttasker.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserAndIsReadFalse(User user);

}

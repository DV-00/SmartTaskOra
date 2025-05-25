package com.smarttasker.services;

import com.smarttasker.exceptions.ResourceNotFoundException;
import com.smarttasker.exceptions.ValidationException;
import com.smarttasker.models.User;
import com.smarttasker.models.UserRole;
import com.smarttasker.repositories.UserRepository;
import com.smarttasker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public User registerUser(User user) {
        validateUser(user);

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new ValidationException("Username already taken");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ValidationException("Email already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(UserRole.USER);
        return userRepository.save(user);
    }

    // Now returns JWT token string on successful login
    public String login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ValidationException("Invalid credentials");
        }

        return jwtUtil.generateToken(user.getUsername());
    }

    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private void validateUser(User user) {
        if (user.getUsername() == null || user.getUsername().length() < 3) {
            throw new ValidationException("Username must be at least 3 characters");
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new ValidationException("Password must be at least 6 characters");
        }
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            throw new ValidationException("Invalid email format");
        }
    }

    public List<Long> getAllUserIds() {
        return userRepository.findAll()
                .stream()
                .map(User::getId)
                .toList();
    }

}

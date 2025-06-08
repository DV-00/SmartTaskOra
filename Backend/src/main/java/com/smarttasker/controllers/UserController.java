package com.smarttasker.controllers;

import com.smarttasker.dto.AuthRequest;
import com.smarttasker.dto.AuthResponse;
import com.smarttasker.dto.UserDTO;
import com.smarttasker.models.User;
import com.smarttasker.services.UserService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class UserController {

    private final UserService userService;
    private final ModelMapper modelMapper;

    @PostMapping("/register")
    public ResponseEntity<UserDTO> registerUser(@Valid @RequestBody UserDTO userDTO) {
        User user = modelMapper.map(userDTO, User.class);
        User registeredUser = userService.registerUser(user);
        UserDTO responseDto = modelMapper.map(registeredUser, UserDTO.class);
        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest authRequest) {
        AuthResponse authResponse = userService.login(authRequest.getUsername(), authRequest.getPassword()); // <--- CHANGE HERE
        return ResponseEntity.ok(authResponse); 
    }

    // Optional: Get user details by ID
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);
        return ResponseEntity.ok(userDTO);
    }
}

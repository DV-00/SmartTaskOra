package com.smarttasker.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String email;

    // This lets you accept password on input (POST/PUT) but hides it on output (GET)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String role;  // String or Enum type
}

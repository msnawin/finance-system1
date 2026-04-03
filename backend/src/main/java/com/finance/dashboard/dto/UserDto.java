package com.finance.dashboard.dto;

import com.finance.dashboard.model.Role;
import com.finance.dashboard.model.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class UserDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotNull(message = "Role is required")
    private Role role;

    private UserStatus status;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
}

package com.finance.dashboard.controller;

import com.finance.dashboard.dto.DashboardSummaryDto;
import com.finance.dashboard.exception.UnauthorizedException;
import com.finance.dashboard.model.Role;
import com.finance.dashboard.service.DashboardService;
import com.finance.dashboard.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getSummary() {
        com.finance.dashboard.model.User user = (com.finance.dashboard.model.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(dashboardService.getDashboardSummary(user.getId(), user.getRole()));
    }
}

package com.finance.dashboard.controller;

import com.finance.dashboard.dto.TransactionDto;
import com.finance.dashboard.exception.UnauthorizedException;
import com.finance.dashboard.model.Role;
import com.finance.dashboard.model.TransactionType;
import com.finance.dashboard.service.TransactionService;
import com.finance.dashboard.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserService userService;

    private com.finance.dashboard.model.User getAuthenticatedUser() {
        return (com.finance.dashboard.model.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(
            @Valid @RequestBody TransactionDto dto) {
        com.finance.dashboard.model.User user = getAuthenticatedUser();
        Role role = user.getRole();
        if (role != Role.ADMIN && role != Role.ANALYST) {
            throw new UnauthorizedException("Viewers cannot create transactions");
        }
        // Actually, requirements say ADMIN has full access. ANALYST can view.
        if (role != Role.ADMIN) {
             throw new UnauthorizedException("Only Admins can create transactions");
        }
        return new ResponseEntity<>(transactionService.createTransaction(dto, user.getId()), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionDto>> getTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        
        com.finance.dashboard.model.User user = getAuthenticatedUser();
        Role role = user.getRole();
        if (role == Role.VIEWER) {
             throw new UnauthorizedException("Viewers can only access dashboard analytics");
        }
        
        return ResponseEntity.ok(transactionService.getTransactions(type, category, startDate, endDate, search, user.getId(), pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDto dto) {
        com.finance.dashboard.model.User user = getAuthenticatedUser();
        return ResponseEntity.ok(transactionService.updateTransaction(id, dto, user.getId(), user.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        com.finance.dashboard.model.User user = getAuthenticatedUser();
        transactionService.deleteTransaction(id, user.getId(), user.getRole());
        return ResponseEntity.noContent().build();
    }
}

package com.finance.dashboard.controller;

import com.finance.dashboard.dto.TransactionDto;
import com.finance.dashboard.exception.UnauthorizedException;
import com.finance.dashboard.model.Role;
import com.finance.dashboard.model.TransactionType;
import com.finance.dashboard.model.User;
import com.finance.dashboard.service.TransactionService;
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

    private User getAuthenticatedUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /**
     * Create a transaction.
     * - ADMIN only: can create and assign transactions to any user via dto.targetUserId.
     * - ANALYST, VIEWER: not allowed.
     */
    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@Valid @RequestBody TransactionDto dto) {
        User caller = getAuthenticatedUser();

        // Admin can assign to a specific user, all others can only create for themselves
        Long ownerId = caller.getId();
        if (caller.getRole() == Role.ADMIN && dto.getTargetUserId() != null) {
            ownerId = dto.getTargetUserId();
        }

        return new ResponseEntity<>(transactionService.createTransaction(dto, ownerId), HttpStatus.CREATED);
    }

    /**
     * Get transactions:
     * - ADMIN & ANALYST: sees ALL transactions.
     * - VIEWER: sees only their own.
     */
    @GetMapping
    public ResponseEntity<Page<TransactionDto>> getTransactions(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search,
            Pageable pageable) {

        User caller = getAuthenticatedUser();

        // Admin and Analyst see everything; Viewer sees only their own
        Long filterUserId = (caller.getRole() == Role.VIEWER) ? caller.getId() : null;

        return ResponseEntity.ok(
            transactionService.getTransactions(type, category, startDate, endDate, search, filterUserId, pageable)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionDto> updateTransaction(
            @PathVariable Long id,
            @Valid @RequestBody TransactionDto dto) {
        User caller = getAuthenticatedUser();
        return ResponseEntity.ok(transactionService.updateTransaction(id, dto, caller.getId(), caller.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        User caller = getAuthenticatedUser();
        transactionService.deleteTransaction(id, caller.getId(), caller.getRole());
        return ResponseEntity.noContent().build();
    }
}

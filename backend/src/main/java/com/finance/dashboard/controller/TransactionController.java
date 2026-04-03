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
     * - ADMIN: can assign to any user via dto.targetUserId; if not provided, assigns to self.
     * - ANALYST: creates transaction linked to themselves.
     * - VIEWER: not allowed.
     */
    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(@Valid @RequestBody TransactionDto dto) {
        User caller = getAuthenticatedUser();
        if (caller.getRole() == Role.VIEWER) {
            throw new UnauthorizedException("Viewers cannot create transactions");
        }

        // Determine the owner of the transaction
        Long ownerId;
        if (caller.getRole() == Role.ADMIN && dto.getTargetUserId() != null) {
            // Admin explicitly assigned to another user
            ownerId = dto.getTargetUserId();
        } else {
            // Analyst or Admin without explicit target → self
            ownerId = caller.getId();
        }

        return new ResponseEntity<>(transactionService.createTransaction(dto, ownerId), HttpStatus.CREATED);
    }

    /**
     * Get transactions:
     * - ADMIN: sees ALL transactions.
     * - ANALYST: sees only their own.
     * - VIEWER: blocked.
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
        if (caller.getRole() == Role.VIEWER) {
            throw new UnauthorizedException("Viewers can only access the dashboard");
        }

        // Admin sees everything; others see only their own
        Long filterUserId = (caller.getRole() == Role.ADMIN) ? null : caller.getId();

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

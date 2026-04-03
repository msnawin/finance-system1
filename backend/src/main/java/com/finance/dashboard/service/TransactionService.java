package com.finance.dashboard.service;

import com.finance.dashboard.dto.TransactionDto;
import com.finance.dashboard.exception.ResourceNotFoundException;
import com.finance.dashboard.exception.UnauthorizedException;
import com.finance.dashboard.model.Role;
import com.finance.dashboard.model.Transaction;
import com.finance.dashboard.model.TransactionType;
import com.finance.dashboard.model.User;
import com.finance.dashboard.repository.TransactionRepository;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionDto createTransaction(TransactionDto dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Transaction transaction = Transaction.builder()
                .amount(dto.getAmount())
                .type(dto.getType())
                .category(dto.getCategory())
                .date(dto.getDate())
                .notes(dto.getNotes())
                .createdBy(user)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToDto(saved);
    }

    public Page<TransactionDto> getTransactions(TransactionType type, String category, LocalDate startDate, LocalDate endDate, String search, Long userId, Pageable pageable) {
        return transactionRepository.findAllFiltered(type, category, startDate, endDate, search, userId, pageable)
                .map(this::mapToDto);
    }

    public TransactionDto updateTransaction(Long id, TransactionDto dto, Long currentUserId, Role currentUserRole) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Admin can update anything, Analyst/Viewer can only update if it is theirs? 
        // Requirements state "When the same user logs in, they should only see their own transactions"
        if (currentUserRole != Role.ADMIN && !transaction.getCreatedBy().getId().equals(currentUserId)) {
             throw new UnauthorizedException("You can only update your own transactions");
        }

        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setCategory(dto.getCategory());
        transaction.setDate(dto.getDate());
        transaction.setNotes(dto.getNotes());

        Transaction updated = transactionRepository.save(transaction);
        return mapToDto(updated);
    }

    public void deleteTransaction(Long id, Long currentUserId, Role currentUserRole) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Allow admins, or allow users to delete their own
        if (currentUserRole != Role.ADMIN && !transaction.getCreatedBy().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only delete your own transactions");
        }

        // Soft delete
        transaction.setDeleted(true);
        transactionRepository.save(transaction);
    }

    private TransactionDto mapToDto(Transaction t) {
        TransactionDto dto = new TransactionDto();
        dto.setId(t.getId());
        dto.setAmount(t.getAmount());
        dto.setType(t.getType());
        dto.setCategory(t.getCategory());
        dto.setDate(t.getDate());
        dto.setNotes(t.getNotes());
        if (t.getCreatedBy() != null) {
            dto.setCreatedById(t.getCreatedBy().getId());
            dto.setCreatedByName(t.getCreatedBy().getName());
        }
        return dto;
    }
}

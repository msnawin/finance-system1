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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionDto createTransaction(TransactionDto dto, Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found: " + ownerId));

        Transaction transaction = Transaction.builder()
                .amount(dto.getAmount())
                .type(dto.getType())
                .category(dto.getCategory())
                .date(dto.getDate())
                .notes(dto.getNotes())
                .createdBy(owner)
                .build();

        return mapToDto(transactionRepository.save(transaction));
    }

    /**
     * @param filterUserId null = admin (return all), non-null = filter to that user
     */
    public Page<TransactionDto> getTransactions(
            TransactionType type, String category,
            LocalDate startDate, LocalDate endDate,
            String search, Long filterUserId, Pageable pageable) {

        return transactionRepository
                .findAllFiltered(filterUserId, type != null ? type.name() : null, category, startDate, endDate, search, pageable)
                .map(this::mapToDto);
    }

    public TransactionDto updateTransaction(Long id, TransactionDto dto, Long callerId, Role callerRole) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (callerRole != Role.ADMIN && !transaction.getCreatedBy().getId().equals(callerId)) {
            throw new UnauthorizedException("You can only update your own transactions");
        }

        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setCategory(dto.getCategory());
        transaction.setDate(dto.getDate());
        transaction.setNotes(dto.getNotes());

        return mapToDto(transactionRepository.save(transaction));
    }

    public void deleteTransaction(Long id, Long callerId, Role callerRole) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        if (callerRole != Role.ADMIN && !transaction.getCreatedBy().getId().equals(callerId)) {
            throw new UnauthorizedException("You can only delete your own transactions");
        }

        transaction.setDeleted(true);
        transactionRepository.save(transaction);
    }

    public TransactionDto mapToDto(Transaction t) {
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

package com.squad20.sistema_climbe.domain.user.service;

import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.dto.UserDTO;
import com.squad20.sistema_climbe.domain.user.mapper.UserMapper;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.exception.ConflictException;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public Page<UserDTO> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public UserDTO findById(Long id) {
        User user = findUserOrThrow(id);
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com e-mail: " + email));
        return userMapper.toDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findByCpf(String cpf) {
        User user = userRepository.findByCpf(cpf)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com CPF: " + cpf));
        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO save(UserDTO dto) {
        validateEmailCpfUnique(dto.getEmail(), dto.getCpf(), null);
        User user = userMapper.toEntity(dto);
        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO update(Long id, UserDTO dto) {
        User user = findUserOrThrow(id);
        validateEmailCpfUnique(dto.getEmail(), dto.getCpf(), id);
        if (dto.getFullName() != null) user.setFullName(dto.getFullName());
        if (dto.getCpf() != null) user.setCpf(dto.getCpf());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus());
        user = userRepository.save(user);
        return userMapper.toDTO(user);
    }

    @Transactional
    public void delete(Long id) {
        User user = findUserOrThrow(id);
        userRepository.delete(user);
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
    }

    private void validateEmailCpfUnique(String email, String cpf, Long excludeUserId) {
        if (email != null && isEmailUsedByOther(email, excludeUserId)) {
            throw new ConflictException("Já existe usuário cadastrado com este e-mail");
        }
        if (cpf != null && isCpfUsedByOther(cpf, excludeUserId)) {
            throw new ConflictException("Já existe usuário cadastrado com este CPF");
        }
    }

    private boolean isEmailUsedByOther(String email, Long excludeUserId) {
        return userRepository.findByEmail(email)
                .map(u -> !u.getId().equals(excludeUserId))
                .orElse(false);
    }

    private boolean isCpfUsedByOther(String cpf, Long excludeUserId) {
        return userRepository.findByCpf(cpf)
                .map(u -> !u.getId().equals(excludeUserId))
                .orElse(false);
    }
}

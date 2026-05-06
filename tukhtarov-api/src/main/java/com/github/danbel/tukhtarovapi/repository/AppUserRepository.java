package com.github.danbel.tukhtarovapi.repository;

import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    @EntityGraph(attributePaths = "clientCompany")
    List<AppUser> findAll();

    @EntityGraph(attributePaths = "clientCompany")
    List<AppUser> findByRoleOrderByFullNameAsc(UserRole role);

    @EntityGraph(attributePaths = "clientCompany")
    Optional<AppUser> findByLoginIgnoreCaseOrEmailIgnoreCase(String login, String email);

    @EntityGraph(attributePaths = "clientCompany")
    Optional<AppUser> findById(Long id);
}

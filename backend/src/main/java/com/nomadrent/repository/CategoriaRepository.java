package com.nomadrent.repository;

import com.nomadrent.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    boolean existsByTituloIgnoreCase(String titulo);
    boolean existsByTituloIgnoreCaseAndIdNot(String titulo, Long id);
}

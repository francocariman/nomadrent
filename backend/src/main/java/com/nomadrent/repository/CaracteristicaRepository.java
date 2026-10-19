package com.nomadrent.repository;

import com.nomadrent.entity.Caracteristica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaracteristicaRepository extends JpaRepository<Caracteristica, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);
}

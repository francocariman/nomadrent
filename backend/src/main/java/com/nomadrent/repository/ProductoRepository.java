package com.nomadrent.repository;

import com.nomadrent.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    /** Orden aleatorio resuelto en BD: no puede devolver repetidos y limita a 10. */
    @Query(value = "SELECT * FROM producto ORDER BY RAND() LIMIT 10", nativeQuery = true)
    List<Producto> findRandom10();

    Page<Producto> findByCategoriaIdIn(Collection<Long> categoriaIds, Pageable pageable);

    long countByCategoriaId(Long categoriaId);

    List<Producto> findByCaracteristicas_Id(Long caracteristicaId);
}

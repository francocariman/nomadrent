package com.nomadrent.repository;

import com.nomadrent.entity.Producto;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long>, JpaSpecificationExecutor<Producto> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    /** Orden aleatorio resuelto en BD: no puede devolver repetidos y limita a 10. */
    @Query(value = "SELECT * FROM producto ORDER BY RAND() LIMIT 10", nativeQuery = true)
    List<Producto> findRandom10();

    long countByCategoriaId(Long categoriaId);

    List<Producto> findByCaracteristicas_Id(Long caracteristicaId);

    @Query("select distinct p.ciudad from Producto p where lower(p.ciudad) like lower(concat('%', :q, '%')) order by p.ciudad")
    List<String> sugerirCiudades(@Param("q") String q, Pageable pageable);

    @Query("select p.nombre from Producto p where lower(p.nombre) like lower(concat('%', :q, '%')) order by p.nombre")
    List<String> sugerirNombres(@Param("q") String q, Pageable pageable);
}

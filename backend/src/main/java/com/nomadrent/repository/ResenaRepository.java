package com.nomadrent.repository;

import com.nomadrent.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {

    List<Resena> findByProductoIdOrderByFechaDesc(Long productoId);

    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    void deleteByProductoId(Long productoId);

    /** Media y cantidad por producto en UNA sola consulta: [productoId, media, total]. */
    @Query("select r.producto.id, avg(r.puntuacion), count(r) from Resena r where r.producto.id in :ids group by r.producto.id")
    List<Object[]> resumenPorProductos(@Param("ids") Collection<Long> ids);
}

package com.nomadrent.repository;

import com.nomadrent.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    /** Solapamiento: existente.inicio < nuevaSalida  Y  existente.fin > nuevaEntrada. */
    boolean existsByProductoIdAndFechaInicioLessThanAndFechaFinGreaterThan(Long productoId, LocalDate nuevaSalida, LocalDate nuevaEntrada);

    /** Reservas que aún ocupan noches (no terminaron antes de `desde`). */
    List<Reserva> findByProductoIdAndFechaFinGreaterThanOrderByFechaInicioAsc(Long productoId, LocalDate desde);

    /** Reservas vigentes o futuras de varios productos a la vez (para calcular fechas alternativas). */
    List<Reserva> findByProductoIdInAndFechaFinGreaterThan(Collection<Long> productoIds, LocalDate desde);

    List<Reserva> findByUsuarioIdOrderByFechaInicioDesc(Long usuarioId);

    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    boolean existsByProductoIdAndFechaFinGreaterThanEqual(Long productoId, LocalDate fecha);

    void deleteByProductoId(Long productoId);

    /**
     * Bloquea la fila del producto hasta el fin de la transacción (SELECT ... FOR UPDATE).
     * Serializa las reservas del MISMO producto: dos peticiones simultáneas no pueden pasar
     * ambas la validación de solapamiento.
     */
    @Query(value = "SELECT id FROM producto WHERE id = :id FOR UPDATE", nativeQuery = true)
    List<Object> bloquearProducto(@Param("id") Long id);
}

package com.nomadrent.repository;

import com.nomadrent.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    /** Solapamiento: existente.inicio < nuevaSalida  Y  existente.fin > nuevaEntrada. */
    boolean existsByProductoIdAndFechaInicioLessThanAndFechaFinGreaterThan(Long productoId, LocalDate nuevaSalida, LocalDate nuevaEntrada);

    /** Reservas que aún ocupan noches (no terminaron antes de `desde`). */
    List<Reserva> findByProductoIdAndFechaFinGreaterThanOrderByFechaInicioAsc(Long productoId, LocalDate desde);

    List<Reserva> findByUsuarioIdOrderByFechaInicioDesc(Long usuarioId);

    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);

    boolean existsByProductoIdAndFechaFinGreaterThanEqual(Long productoId, LocalDate fecha);

    void deleteByProductoId(Long productoId);
}

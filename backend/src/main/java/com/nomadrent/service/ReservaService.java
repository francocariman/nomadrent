package com.nomadrent.service;

import com.nomadrent.dto.RangoOcupado;
import com.nomadrent.dto.ReservaRequest;
import com.nomadrent.dto.ReservaResponse;
import com.nomadrent.entity.Producto;
import com.nomadrent.entity.Reserva;
import com.nomadrent.entity.Usuario;
import com.nomadrent.exception.AccesoDenegadoException;
import com.nomadrent.exception.ProductoNoEncontradoException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.ProductoRepository;
import com.nomadrent.repository.ReservaRepository;
import com.nomadrent.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservaService {

    public static final int MAX_NOCHES = 90;

    private final ReservaRepository reservas;
    private final ProductoRepository productos;
    private final UsuarioRepository usuarios;

    public ReservaService(ReservaRepository reservas, ProductoRepository productos, UsuarioRepository usuarios) {
        this.reservas = reservas;
        this.productos = productos;
        this.usuarios = usuarios;
    }

    /** Rangos de noches ocupadas (de hoy en adelante) para pintar el calendario del detalle. */
    @Transactional(readOnly = true)
    public List<RangoOcupado> disponibilidad(Long productoId) {
        if (!productos.existsById(productoId)) throw new ProductoNoEncontradoException(productoId);
        return reservas.findByProductoIdAndFechaFinGreaterThanOrderByFechaInicioAsc(productoId, LocalDate.now()).stream()
                .map(r -> new RangoOcupado(r.getFechaInicio(), r.getFechaFin()))
                .toList();
    }

    @Transactional
    public ReservaResponse crear(String email, ReservaRequest req) {
        Usuario u = usuarios.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AccesoDenegadoException("Debes iniciar sesión."));
        Producto p = productos.findById(req.productoId())
                .orElseThrow(() -> new ProductoNoEncontradoException(req.productoId()));

        if (req.fechaInicio().isBefore(LocalDate.now())) {
            throw new ReglaNegocioException("La fecha de entrada no puede ser anterior a hoy.");
        }
        if (!req.fechaFin().isAfter(req.fechaInicio())) {
            throw new ReglaNegocioException("La fecha de salida debe ser posterior a la de entrada.");
        }
        if (ChronoUnit.DAYS.between(req.fechaInicio(), req.fechaFin()) > MAX_NOCHES) {
            throw new ReglaNegocioException("La estadía máxima es de " + MAX_NOCHES + " noches.");
        }
        if (reservas.existsByProductoIdAndFechaInicioLessThanAndFechaFinGreaterThan(p.getId(), req.fechaFin(), req.fechaInicio())) {
            throw new ReglaNegocioException("Las fechas seleccionadas ya no están disponibles. Elige otras fechas.");
        }

        Reserva r = new Reserva();
        r.setUsuario(u);
        r.setProducto(p);
        r.setFechaInicio(req.fechaInicio());
        r.setFechaFin(req.fechaFin());
        return ReservaResponse.from(reservas.save(r));
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listarMias(String email) {
        Usuario u = usuarios.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new AccesoDenegadoException("Debes iniciar sesión."));
        return reservas.findByUsuarioIdOrderByFechaInicioDesc(u.getId()).stream().map(ReservaResponse::from).toList();
    }
}

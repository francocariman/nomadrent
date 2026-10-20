package com.nomadrent.service;

import com.nomadrent.dto.*;
import com.nomadrent.entity.Caracteristica;
import com.nomadrent.entity.Categoria;
import com.nomadrent.entity.Producto;
import com.nomadrent.entity.Reserva;
import com.nomadrent.exception.NombreDuplicadoException;
import com.nomadrent.exception.ProductoNoEncontradoException;
import com.nomadrent.exception.RecursoNoEncontradoException;
import com.nomadrent.exception.ReglaNegocioException;
import com.nomadrent.repository.*;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductoService {

    public static final int PAGE_SIZE = 10;
    /** Hasta cuántos días antes/después de lo pedido se buscan fechas alternativas. */
    static final int ALTERNATIVAS_HORIZONTE_DIAS = 365;
    static final int ALTERNATIVAS_MAX_RESULTADOS = 3;

    private final ProductoRepository repository;
    private final CategoriaRepository categorias;
    private final CaracteristicaRepository caracteristicas;
    private final ResenaRepository resenas;
    private final FavoritoRepository favoritos;
    private final ReservaRepository reservas;

    public ProductoService(ProductoRepository repository, CategoriaRepository categorias,
                           CaracteristicaRepository caracteristicas, ResenaRepository resenas,
                           FavoritoRepository favoritos, ReservaRepository reservas) {
        this.repository = repository;
        this.categorias = categorias;
        this.caracteristicas = caracteristicas;
        this.resenas = resenas;
        this.favoritos = favoritos;
        this.reservas = reservas;
    }

    // ------------------------------------------------------------------ mapeo con puntuación

    /** Convierte a DTO agregando media y total de reseñas con UNA sola consulta para toda la lista. */
    @Transactional(readOnly = true)
    public List<ProductoResponse> toResponses(Collection<Producto> lista) {
        if (lista.isEmpty()) return List.of();
        List<Long> ids = lista.stream().map(Producto::getId).toList();
        Map<Long, ResumenPuntuacion> stats = new HashMap<>();
        for (Object[] fila : resenas.resumenPorProductos(ids)) {
            double media = Math.round(((Number) fila[1]).doubleValue() * 10.0) / 10.0;
            stats.put((Long) fila[0], new ResumenPuntuacion(media, ((Number) fila[2]).longValue()));
        }
        return lista.stream()
                .map(p -> ProductoResponse.from(p, stats.getOrDefault(p.getId(), ResumenPuntuacion.VACIO)))
                .toList();
    }

    public ProductoResponse toResponse(Producto p) {
        return toResponses(List.of(p)).get(0);
    }

    // ------------------------------------------------------------------ consultas

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarAleatorios() {
        return toResponses(repository.findRandom10());
    }

    /**
     * Catálogo paginado con filtros combinables (todos opcionales):
     * categorías (selección múltiple), destino (ciudad o nombre) y rango de fechas libre de reservas.
     */
    @Transactional(readOnly = true)
    public PaginaResponse<ProductoResponse> listarPaginado(int page, List<Long> categoriaIds, String destino,
                                                           LocalDate desde, LocalDate hasta) {
        if ((desde == null) != (hasta == null)) {
            throw new ReglaNegocioException("Indica la fecha de entrada y la de salida.");
        }
        if (desde != null && !hasta.isAfter(desde)) {
            throw new ReglaNegocioException("La fecha de salida debe ser posterior a la de entrada.");
        }
        Pageable pageable = PageRequest.of(Math.max(page, 0), PAGE_SIZE, Sort.by("id").ascending());
        Page<Producto> result = repository.findAll(especificacion(categoriaIds, destino, desde, hasta), pageable);
        return new PaginaResponse<>(toResponses(result.getContent()),
                result.getNumber(), result.getSize(), result.getTotalPages(), result.getTotalElements());
    }

    private Specification<Producto> especificacion(List<Long> categoriaIds, String destino, LocalDate desde, LocalDate hasta) {
        Specification<Producto> spec = (root, query, cb) -> cb.conjunction();

        if (categoriaIds != null && !categoriaIds.isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("categoria").get("id").in(categoriaIds));
        }
        if (destino != null && !destino.isBlank()) {
            String patron = "%" + destino.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.<String>get("ciudad")), patron),
                    cb.like(cb.lower(root.<String>get("nombre")), patron)));
        }
        if (desde != null && hasta != null) {
            // NOT EXISTS (reserva que se solape con [desde, hasta))
            spec = spec.and((root, query, cb) -> {
                Subquery<Long> sub = query.subquery(Long.class);
                Root<Reserva> r = sub.from(Reserva.class);
                sub.select(r.<Long>get("id")).where(
                        cb.equal(r.get("producto"), root),
                        cb.lessThan(r.<LocalDate>get("fechaInicio"), hasta),
                        cb.greaterThan(r.<LocalDate>get("fechaFin"), desde));
                return cb.not(cb.exists(sub));
            });
        }
        return spec;
    }


    /**
     * Cuando un destino existe pero no tiene las fechas pedidas libres, calcula para cada alojamiento
     * del destino la ventana libre MÁS CERCANA (misma cantidad de noches, antes o después) y devuelve
     * los mejores. Lista vacía si el destino no existe o no hay ninguna ventana dentro del horizonte.
     */
    @Transactional(readOnly = true)
    public List<AlternativaResponse> alternativas(String destino, List<Long> categoriaIds, LocalDate desde, LocalDate hasta) {
        if (destino == null || destino.isBlank()) {
            throw new ReglaNegocioException("Indica un destino para sugerir fechas alternativas.");
        }
        if (desde == null || hasta == null || !hasta.isAfter(desde)) {
            throw new ReglaNegocioException("Indica fechas de entrada y salida válidas.");
        }
        long noches = ChronoUnit.DAYS.between(desde, hasta);
        if (noches > ReservaService.MAX_NOCHES) return List.of();

        List<Producto> candidatos = repository.findAll(
                especificacion(categoriaIds, destino, null, null),
                PageRequest.of(0, 20, Sort.by("id").ascending())).getContent();
        if (candidatos.isEmpty()) return List.of();

        LocalDate hoy = LocalDate.now();
        Map<Long, List<Reserva>> ocupadas = reservas
                .findByProductoIdInAndFechaFinGreaterThan(candidatos.stream().map(Producto::getId).toList(), hoy)
                .stream().collect(Collectors.groupingBy(r -> r.getProducto().getId()));

        List<AlternativaResponse> out = new ArrayList<>();
        for (Producto p : candidatos) {
            List<Reserva> rs = ocupadas.getOrDefault(p.getId(), List.of());
            for (int k = 1; k <= ALTERNATIVAS_HORIZONTE_DIAS; k++) {
                LocalDate inicio = null;
                LocalDate despues = desde.plusDays(k);
                LocalDate antes = desde.minusDays(k);
                if (!despues.isBefore(hoy) && ventanaLibre(rs, despues, noches)) inicio = despues;
                else if (!antes.isBefore(hoy) && ventanaLibre(rs, antes, noches)) inicio = antes;
                if (inicio != null) {
                    String imagen = p.getImagenes().isEmpty() ? null : p.getImagenes().get(0);
                    out.add(new AlternativaResponse(p.getId(), p.getNombre(), p.getCiudad(), imagen, p.getPrecio(),
                            inicio, inicio.plusDays(noches), noches,
                            ChronoUnit.DAYS.between(desde, inicio), noches * p.getPrecio()));
                    break; // la primera ventana encontrada es la más cercana
                }
            }
        }
        out.sort(Comparator.comparingLong((AlternativaResponse a) -> Math.abs(a.desplazamientoDias()))
                .thenComparing(AlternativaResponse::precio));
        return out.stream().limit(ALTERNATIVAS_MAX_RESULTADOS).toList();
    }

    /** true si ninguna reserva se solapa con las noches [inicio, inicio + noches). */
    private static boolean ventanaLibre(List<Reserva> reservas, LocalDate inicio, long noches) {
        LocalDate fin = inicio.plusDays(noches);
        for (Reserva r : reservas) {
            if (r.getFechaInicio().isBefore(fin) && r.getFechaFin().isAfter(inicio)) return false;
        }
        return true;
    }

    @Transactional(readOnly = true)
    public List<SugerenciaResponse> sugerencias(String q) {
        if (q == null || q.trim().length() < 2) return List.of();
        String t = q.trim();
        List<SugerenciaResponse> out = new ArrayList<>();
        repository.sugerirCiudades(t, PageRequest.of(0, 5)).forEach(c -> out.add(new SugerenciaResponse("CIUDAD", c)));
        repository.sugerirNombres(t, PageRequest.of(0, 5)).forEach(n -> out.add(new SugerenciaResponse("ALOJAMIENTO", n)));
        return out;
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(Long id) {
        return toResponse(repository.findById(id).orElseThrow(() -> new ProductoNoEncontradoException(id)));
    }

    // ------------------------------------------------------------------ escritura

    @Transactional
    public ProductoResponse crear(ProductoRequest req) {
        String nombre = req.nombre().trim();
        if (repository.existsByNombreIgnoreCase(nombre)) {
            throw new NombreDuplicadoException(nombre);
        }
        Producto p = new Producto();
        aplicar(p, req);
        return toResponse(repository.save(p));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest req) {
        Producto p = repository.findById(id).orElseThrow(() -> new ProductoNoEncontradoException(id));
        String nombre = req.nombre().trim();
        if (repository.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw new NombreDuplicadoException(nombre);
        }
        aplicar(p, req);
        return toResponse(repository.save(p));
    }

    /**
     * Elimina el producto junto con sus favoritos, reseñas y reservas ya finalizadas.
     * Si tiene reservas vigentes o futuras se rechaza, para no romper estadías de otros usuarios.
     */
    @Transactional
    public void eliminar(Long id) {
        if (!repository.existsById(id)) {
            throw new ProductoNoEncontradoException(id);
        }
        if (reservas.existsByProductoIdAndFechaFinGreaterThanEqual(id, LocalDate.now())) {
            throw new ReglaNegocioException("No se puede eliminar: el alojamiento tiene reservas vigentes o futuras.");
        }
        favoritos.deleteByProductoId(id);
        resenas.deleteByProductoId(id);
        reservas.deleteByProductoId(id);
        repository.deleteById(id);
    }

    /** Copia los datos del request a la entidad, resolviendo categoría, características y políticas. */
    private void aplicar(Producto p, ProductoRequest req) {
        Categoria categoria = categorias.findById(req.categoriaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("La categoría seleccionada no existe."));

        Set<Long> ids = req.caracteristicaIds() == null ? Set.of() : new LinkedHashSet<>(req.caracteristicaIds());
        List<Caracteristica> encontradas = caracteristicas.findAllById(ids);
        if (encontradas.size() != ids.size()) {
            throw new ReglaNegocioException("Alguna de las características seleccionadas no existe.");
        }

        p.setNombre(req.nombre().trim());
        p.setDescripcion(req.descripcion().trim());
        p.setCategoria(categoria);
        p.setCiudad(req.ciudad().trim());
        p.setPrecio(req.precio());
        p.getImagenes().clear();
        req.imagenes().forEach(u -> p.getImagenes().add(u.trim()));
        p.getCaracteristicas().clear();
        p.getCaracteristicas().addAll(encontradas);
        p.setPoliticas(req.politicas() != null ? req.politicas().toEntity() : new com.nomadrent.entity.Politica("", "", ""));
    }
}

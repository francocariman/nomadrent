package com.nomadrent.repository;

import com.nomadrent.entity.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    List<Favorito> findByUsuarioIdOrderByIdDesc(Long usuarioId);
    Optional<Favorito> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
    void deleteByProductoId(Long productoId);
}

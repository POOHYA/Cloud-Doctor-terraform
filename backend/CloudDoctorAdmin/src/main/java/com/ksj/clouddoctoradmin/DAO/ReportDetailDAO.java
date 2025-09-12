package com.ksj.clouddoctoradmin.DAO;

import com.ksj.clouddoctoradmin.entity.ReportDetail;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReportDetailDAO {
    @PersistenceContext
    private EntityManager em;

    public void save(ReportDetail detail) {
        em.persist(detail);
    }

    public ReportDetail findById(Long id) {
        return em.find(ReportDetail.class, id);
    }

    public List<ReportDetail> findAll() {
        return em.createQuery("SELECT d FROM ReportDetail d", ReportDetail.class).getResultList();
    }

    public void delete(Long id) {
        ReportDetail d = findById(id);
        if (d != null) em.remove(d);
    }
}
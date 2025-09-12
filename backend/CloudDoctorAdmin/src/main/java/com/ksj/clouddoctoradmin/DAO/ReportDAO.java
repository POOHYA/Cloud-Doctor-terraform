package com.ksj.clouddoctoradmin.DAO;

import com.ksj.clouddoctoradmin.entity.Report;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReportDAO {
    @PersistenceContext
    private EntityManager em;

    public void save(Report report) {
        em.persist(report);
    }

    public Report findById(Long id) {
        return em.find(Report.class, id);
    }

    public List<Report> findAll() {
        return em.createQuery("SELECT r FROM Report r", Report.class).getResultList();
    }

    public void delete(Long id) {
        Report r = findById(id);
        if (r != null) em.remove(r);
    }
}

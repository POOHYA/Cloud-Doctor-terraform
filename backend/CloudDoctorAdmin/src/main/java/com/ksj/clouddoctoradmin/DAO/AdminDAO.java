package com.ksj.clouddoctoradmin.DAO;

import com.ksj.clouddoctoradmin.entity.Admin;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AdminDAO {
    @PersistenceContext
    private EntityManager em;

    // 저장
    public void save(Admin admin) {
        em.persist(admin);
    }
    // 단건 조회
    public Admin findById(Long id) {
        return em.find(Admin.class, id);
    }
    // 전체 조회
    public List<Admin> findAll() {
        return em.createQuery("SELECT a FROM Admin a", Admin.class).getResultList();
    }

    public void delete(Long id) {
        Admin a = findById(id);
        if (a != null) em.remove(a);
    }
}

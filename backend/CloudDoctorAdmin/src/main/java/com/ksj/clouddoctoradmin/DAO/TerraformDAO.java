package com.ksj.clouddoctoradmin.DAO;

import com.ksj.clouddoctoradmin.entity.Terraform;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TerraformDAO {
    @PersistenceContext
    private EntityManager em;

    public void save(Terraform terraform) {
        em.persist(terraform);
    }

    public Terraform findById(Long id) {
        return em.find(Terraform.class, id);
    }

    public List<Terraform> findAll() {
        return em.createQuery("SELECT t FROM Terraform t", Terraform.class).getResultList();
    }

    public void delete(Long id) {
        Terraform t = findById(id);
        if (t != null) em.remove(t);
    }
}

package com.ksj.clouddoctoradmin.DAO;

import com.ksj.clouddoctoradmin.entity.Ansible;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AnsibleDAO {
    @PersistenceContext
    private EntityManager em;

    public void save(Ansible ansible) {
        em.persist(ansible);
    }

    public Ansible findById(Long id) {
        return em.find(Ansible.class, id);
    }

    public List<Ansible> findAll() {
        return em.createQuery("SELECT a FROM Ansible a", Ansible.class).getResultList();
    }

    public void delete(Long id) {
        Ansible ansible = findById(id);
        if (ansible != null) em.remove(ansible);
    }
}

package com.squad20.sistema_climbe.domain.report.repository;

import com.squad20.sistema_climbe.domain.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByContract_Id(Long contractId);
}

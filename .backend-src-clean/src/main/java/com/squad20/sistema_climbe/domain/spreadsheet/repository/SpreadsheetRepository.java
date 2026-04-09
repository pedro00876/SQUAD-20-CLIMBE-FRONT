package com.squad20.sistema_climbe.domain.spreadsheet.repository;

import com.squad20.sistema_climbe.domain.spreadsheet.entity.Spreadsheet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpreadsheetRepository extends JpaRepository<Spreadsheet, Long> {

    List<Spreadsheet> findByContract_Id(Long contractId);
}


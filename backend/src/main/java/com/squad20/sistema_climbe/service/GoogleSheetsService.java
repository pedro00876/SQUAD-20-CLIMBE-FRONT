package com.squad20.sistema_climbe.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.squad20.sistema_climbe.config.GoogleApiConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleSheetsService {

    private final GoogleApiConfig googleApiConfig;

    public List<List<Object>> readSheetData(String accessTokenStr, String spreadsheetId, String range) throws GeneralSecurityException, IOException {
        Sheets service = googleApiConfig.getSheetsService(accessTokenStr);
        ValueRange response = service.spreadsheets().values()
                .get(spreadsheetId, range)
                .execute();
        return response.getValues();
    }
}

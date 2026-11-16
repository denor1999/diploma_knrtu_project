package com.app.denor1999.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ApiException.class)
	ResponseEntity<Map<String, String>> handle(ApiException exception) {
		return ResponseEntity.status(exception.getStatus()).body(Map.of("detail", exception.getMessage()));
	}

}

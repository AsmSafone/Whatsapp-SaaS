package com.asmsafone.zaptura.model;

/** Acknowledgement returned by {@code POST /messages/send-bulk} (HTTP 202). */
public record BulkMessageResponse(
    String batchId,
    String status,
    int totalMessages,
    String estimatedCompletionTime,
    String statusUrl) {}

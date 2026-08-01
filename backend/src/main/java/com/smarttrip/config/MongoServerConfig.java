package com.smarttrip.config;

import de.bwaldvogel.mongo.MongoServer;
import de.bwaldvogel.mongo.backend.memory.MemoryBackend;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

@Slf4j
@Configuration
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MongoServerConfig {

    private MongoServer server;

    @PostConstruct
    public void startServer() {
        // Auto-detect if official native MongoDB Server is already listening on port 27017
        try (java.net.Socket socket = new java.net.Socket("127.0.0.1", 27017)) {
            log.info("Official Native MongoDB Server detected running on port 27017. Using native MongoDB.");
            return;
        } catch (Exception ignored) {
            // Port 27017 is free, start in-memory server fallback
        }

        try {
            server = new MongoServer(new MemoryBackend());
            server.bind("0.0.0.0", 27017);
            log.info("Started In-Memory MongoDB fallback server on 0.0.0.0:27017");
        } catch (Exception e) {
            log.warn("In-Memory MongoServer notice: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void stopServer() {
        if (server != null) {
            server.shutdown();
            log.info("Stopped In-Memory MongoDB server.");
        }
    }
}

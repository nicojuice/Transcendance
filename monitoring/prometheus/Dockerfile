FROM prom/prometheus:latest

# Copie la config personnalisée dans l'image
COPY prometheus.yml /etc/prometheus/prometheus.yml

# Déclare le port pour Prometheus UI
EXPOSE 9090

# Le binaire d'entrée reste celui par défaut : prometheus
CMD ["--config.file=/etc/prometheus/prometheus.yml"]
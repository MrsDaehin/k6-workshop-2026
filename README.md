# OpenTelemetry Demo — Despliegue en Kubernetes

Instrucciones para desplegar la aplicación de ejemplo de OpenTelemetry en un clúster Kubernetes existente usando Helm.

## Prerrequisitos

- Kubernetes 1.24+
- 6 GB de RAM libre para la aplicación
- Helm 3.14+

## Instalación con Helm

Agregar el repositorio de Helm de OpenTelemetry:

```shell
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
```

Instalar el chart con el nombre `my-otel-demo`:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo
```

> **Nota:** El chart no soporta actualizaciones entre versiones. Para actualizar, elimine el release existente e instale la nueva versión.

### Generar manifiestos de Kubernetes

```shell
helm template opentelemetry-demo open-telemetry/opentelemetry-demo --namespace otel-demo > opentelemetry-demo.yaml
kubectl apply -f opentelemetry-demo.yaml
```

## Usar la aplicación

### Exponer servicios con `kubectl port-forward`

```shell
kubectl --namespace default port-forward svc/frontend-proxy 8080:8080
```

Una vez establecido el port-forward, acceda a:

| Servicio             | URL                                                   |
| -------------------- | ----------------------------------------------------- |
| Web store            | http://localhost:8080/                                 |
| Grafana              | http://localhost:8080/grafana/                         |
| Load Generator UI    | http://localhost:8080/loadgen/                         |
| Jaeger UI            | http://localhost:8080/jaeger/ui/                       |
| Flagd configurator   | http://localhost:8080/feature                          |

### Exponer con Ingress

```yaml
components:
  frontend-proxy:
    ingress:
      enabled: true
      annotations: {}
      hosts:
        - host: otel-demo.my-domain.com
          paths:
            - path: /
              pathType: Prefix
              port: 8080
```

### Exponer con LoadBalancer

```yaml
components:
  frontend-proxy:
    service:
      type: LoadBalancer
```

### Telemetría del navegador

```yaml
components:
  frontend:
    envOverrides:
      - name: PUBLIC_OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
        value: http://otel-demo.my-domain.com/otlp-http/v1/traces
```

## Usar tu propio backend

Cree un archivo `my-values-file.yaml` con sus exportadores:

```yaml
opentelemetry-collector:
  config:
    exporters:
      otlphttp/example:
        endpoint: <your-endpoint-url>
    service:
      pipelines:
        traces:
          exporters: [spanmetrics, otlphttp/example]
```

Instale con valores personalizados:

```shell
helm install my-otel-demo open-telemetry/opentelemetry-demo --values my-values-file.yaml
```

> **Nota:** Al sobrescribir `exporters` en un pipeline, incluya siempre `spanmetrics` para evitar errores.

## Referencias

- [OpenTelemetry Demo Helm Chart](https://opentelemetry.io/docs/platforms/kubernetes/helm/demo/)
- [Documentación oficial de Helm](https://helm.sh/docs/)

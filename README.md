# Online Boutique on Minikube

This README adapts the official development guide from the Google Cloud Platform microservices demo so you can run an e-commerce sample application on a local Minikube cluster.

## What you will deploy

The repository contains Online Boutique, a sample e-commerce application composed of multiple microservices.

## Prerequisites

Make sure these tools are installed and available in your shell:

- Docker or Docker Desktop
- kubectl
- skaffold 2.0.2 or newer
- Minikube

For Minikube, the guide recommends at least:

- 4 CPUs
- 4 GiB of memory
- 32 GiB of disk space

## 1. Clone the repository

```sh
git clone https://github.com/GoogleCloudPlatform/microservices-demo.git
cd microservices-demo
```

## 2. Start a local Minikube cluster

```sh
minikube start --cpus=4 --memory=4096 --disk-size=32g
```

Verify that the cluster is ready:

```sh
kubectl get nodes
```

## 3. Deploy the application

Run the deployment with skaffold:

```sh
skaffold run
```

This step may take a while on the first run because it builds and deploys the container images.

If you want skaffold to rebuild automatically while you change the code, use:

```sh
skaffold dev
```

## 4. Check the deployed pods

```sh
kubectl get pods
```

Wait until the pods are running and ready.

## 5. Access the storefront

Forward the frontend port locally:

```sh
kubectl port-forward deployment/frontend 8080:8080
```

Then open:

```text
http://localhost:8080
```

## Cleanup

To remove the deployed resources:

```sh
skaffold delete
```

To stop Minikube entirely:

```sh
minikube stop
```

## References

- Official development guide: https://github.com/GoogleCloudPlatform/microservices-demo/blob/main/docs/development-guide.md
- Online Boutique repository: https://github.com/GoogleCloudPlatform/microservices-demo


### How to sort the scripts in k6

[Office Hours](https://www.youtube.com/watch?v=zDtEzp_JUOE)

[repo](https://github.com/grafana/k6-example-woocommerce/blob/main/main.js)

[Chai Checks](https://k6.io/blog/k6-chai-js/#stability)

[Advanced Scenarios](https://k6.io/docs/using-k6/scenarios/advanced-examples/)
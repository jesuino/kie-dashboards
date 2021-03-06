# KIE Dashboards
Dashboards for Kie components


## Modify Dashboards

Export the system property `DASHBUILDER_AUTHORING` to point to a Dashbuilder Authoring JAR

Download it from: WIP

Then run the script `runAuthoring.sh` pointing to the path of dashboards files e.g. `./runAuthoring.sh packages/kie-server-process-dashboard/`

Dashboards when modified will be exported to `packages/dashboards`. These ZIPs can be exported to run on Dashbuilder Runtime

Access `http://localhost:8080` to edit your dashboard.

## Running Dashbuilder Runtime

Export the system property `DASHBUILDER_RUNTIME` to point to a Dashbuilder Runtime JAR

Download it from: WIP

Then go to `localhost:8180` to modify the existing dashboards. Changing the dasshboards trigger a reload on Dashbuilder Runtime


## Edit the dashboard using a container image

YOu can use `dashbuilder-authoring` to edit the dashboard. Use the following podman command:

```
podman run -p 8080:8080 \
        -v ./packages/kie-server-process-dashboard/:/opt/jboss/.dashbuilder:Z \
        -v ./packages/components/:/tmp/dashbuilder/components:Z \
        -dti  quay.io/kogito_tooling_bot/dashbuilder-authoring:0.14.1
```

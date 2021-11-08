DIR=`pwd`
PARENT_DIR="$(dirname "$DIR")"
COMPONENTS_DIR="$PARENT_DIR/components"
MODELS_DIR="$PARENT_DIR/dashboards"
java -jar -Ddashbuilder.export.location=$MODELS_DIR/kie-server-process-dashboard.zip -Ddashbuilder.components.dir=$COMPONENTS_DIR -Dorg.dashbuilder.project.location=. $1

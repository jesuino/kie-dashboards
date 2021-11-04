DIR=`pwd`
COMPONENTS_DIR="$(dirname "$DIR")/components"
java -jar -Ddashbuilder.export.location=./kie-server-process-dashboard.zip -Ddashbuilder.components.dir=$COMPONENTS_DIR -Dorg.dashbuilder.project.location=. $1

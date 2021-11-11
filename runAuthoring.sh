if [ -z ${DASHBUILDER_AUTHORING+x} ]; 
then
	echo "DASHBUILDER_AUTHORING is not set";
	exit 0;
fi
DIR=`pwd`
COMPONENTS_DIR="$DIR/packages/components"
MODELS_DIR="$DIR/packages/dashboards"
MODEL_FILE="$(basename $1).zip"
echo "Exporting to $MODEL_FILE"
java -jar -Ddashbuilder.export.location=$MODELS_DIR/$MODEL_FILE \
		  -Ddashbuilder.components.dir=$COMPONENTS_DIR \
		  -Dorg.dashbuilder.project.location=$1 \
          -Ddashbuilder.kieserver.serverTemplate.sample-server.location=http://localhost:8280/kie-server/services/rest/server \
          -Ddashbuilder.kieserver.serverTemplate.sample-server.user=kieserver \
          -Ddashbuilder.kieserver.serverTemplate.sample-server.password=kieserver1! \
          -Ddashbuilder.kieserver.serverTemplate.sample-server.replace_query=true \
          -Ddashbuilder.kieserver.serverTemplates=sample-server $DASHBUILDER_AUTHORING
